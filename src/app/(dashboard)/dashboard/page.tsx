"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Copy,
  Users,
  DollarSign,
  Handshake,
  Eye,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  usePartnerDashboard,
  useUpdatePaymentDetails,
  useRequestPayout,
} from "@/services/partner";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <Skeleton className="h-80" />
    <Skeleton className="h-40" />
  </div>
);

const chartConfig = {
  total: {
    label: "Доход (₽)",
    color: "hsl(var(--primary))",
  },
};

export default function PartnerDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("v");
  const hasAttemptedTransfer = useRef(false);

  // Environment variables
  const mainAppUrl =
    process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";

  // --- 1. AUTHENTICATION & TRANSFER LOGIC ---
  useEffect(() => {
    // If the user arrived with a transfer token, log them in silently
    if (token && !hasAttemptedTransfer.current) {
      hasAttemptedTransfer.current = true;
      signIn("credentials", {
        transferToken: token,
        redirect: false,
      }).then((res) => {
        if (res?.ok) {
          // Clean the URL so the token isn't sitting in the address bar
          router.replace("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Срок действия ссылки истек. Авторизуйтесь заново.",
          });
          window.location.href = `${mainAppUrl}/login`;
        }
      });
    } else if (status === "unauthenticated" && !token) {
      // If not logged in and no token is present, bounce them back to the main app
      window.location.href = `${mainAppUrl}/login`;
    }
  }, [token, status, router, mainAppUrl, toast]);

  // --- 2. DATA FETCHING ---
  const userId = session?.user?.id;

  // Prevent React Query from running until we have a verified user session
  const isReadyToFetch =
    status === "authenticated" && !!userId && session?.user?.role === "partner";

  const {
    data: dashboardData,
    isLoading,
    error,
  } = usePartnerDashboard(isReadyToFetch ? userId : undefined);

  const updatePaymentMutation = useUpdatePaymentDetails();
  const requestPayoutMutation = useRequestPayout();

  const [paymentDetails, setPaymentDetails] = useState("");

  useEffect(() => {
    if (dashboardData?.paymentDetails) {
      setPaymentDetails(dashboardData.paymentDetails);
    }
  }, [dashboardData?.paymentDetails]);

  // --- HANDLERS ---
  const handleCopyToClipboard = () => {
    if (!dashboardData) return;
    const referralLink = `${mainAppUrl}/register?ref=${dashboardData.referralId}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Скопировано!",
      description: "Реферальная ссылка скопирована в буфер обмена.",
    });
  };

  const handleSavePaymentDetails = () => {
    if (!userId) return;
    updatePaymentMutation.mutate(
      { partnerId: userId, paymentDetails },
      {
        onSuccess: () =>
          toast({
            title: "Сохранено",
            description: "Ваши платежные реквизиты обновлены.",
          }),
        onError: (err: any) =>
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: err.message,
          }),
      },
    );
  };

  const handleRequestPayout = () => {
    if (!userId) return;
    requestPayoutMutation.mutate(userId, {
      onSuccess: () =>
        toast({
          title: "Запрос отправлен",
          description: "Ваш запрос на выплату передан в обработку.",
        }),
      onError: (err: any) =>
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: err.message,
        }),
    });
  };

  // --- RENDER STATES ---

  // Show skeleton if NextAuth is still checking session, or if we are actively logging in via token
  if (
    status === "loading" ||
    (token && !hasAttemptedTransfer.current) ||
    isLoading
  ) {
    return (
      <div className="container mx-auto py-10 max-w-6xl">
        <DashboardSkeleton />
      </div>
    );
  }

  // Security Check: If they somehow got a session but are NOT a partner
  if (status === "authenticated" && session?.user?.role !== "partner") {
    return (
      <div className="container mx-auto py-20 text-center max-w-xl">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Доступ запрещен</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          Этот портал предназначен исключительно для партнеров. Вы вошли как{" "}
          {session.user.role}.
        </p>
        <Button onClick={() => (window.location.href = mainAppUrl)}>
          Вернуться на главную платформу
        </Button>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto py-20 text-center max-w-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Ошибка загрузки</h2>
        <p className="text-muted-foreground mt-2">
          Не удалось загрузить данные дашборда.
        </p>
      </div>
    );
  }

  const {
    referralId,
    balance,
    totalEarned,
    totalRegistrations,
    clicks,
    monthlyRevenue,
    referralEvents,
    minPayout,
  } = dashboardData;

  const canRequestPayout = balance >= minPayout;

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Кабинет партнера</h1>
        <p className="text-muted-foreground mt-1">
          Отслеживайте вашу статистику и управляйте финансами.
        </p>
      </div>

      {/* Referral Link Area */}
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-lg">
          <div className="flex-grow w-full">
            <Label
              htmlFor="referralLink"
              className="text-primary font-semibold mb-2 block"
            >
              Ваша уникальная реферальная ссылка
            </Label>
            <Input
              id="referralLink"
              readOnly
              className="bg-white border-primary/20 font-mono text-sm"
              value={`${mainAppUrl}/register?ref=${referralId}`}
            />
          </div>
          <Button
            onClick={handleCopyToClipboard}
            className="mt-2 sm:mt-7 shrink-0 shadow-sm"
          >
            <Copy className="mr-2 h-4 w-4" /> Скопировать
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="payouts">Выплаты</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Текущий баланс
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {balance.toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-muted-foreground">
                  Готово к выплате
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего заработано
                </CardTitle>
                <Handshake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalEarned.toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-xs text-muted-foreground">За все время</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Регистраций
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{totalRegistrations}</div>
                <p className="text-xs text-muted-foreground">
                  Привлечено исполнителей
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Переходов</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clicks}</div>
                <p className="text-xs text-muted-foreground">
                  По реферальной ссылке
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Доход по месяцам</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} ₽`}
                  />
                  <ChartTooltip
                    cursor={{ fill: "transparent" }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. EVENTS TAB */}
        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Реферальные события</CardTitle>
              <CardDescription>
                Список всех регистраций и оплат по вашей ссылке.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Событие</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead className="text-right">
                        Вознаграждение
                      </TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralEvents && referralEvents.length > 0 ? (
                      referralEvents.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(event.createdAt).toLocaleDateString(
                              "ru-RU",
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {event.eventType === "registration"
                              ? "Регистрация"
                              : "Оплата тарифа"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {event.referredUserId.substring(0, 8)}***
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {event.commissionAmount ? (
                              <span className="text-emerald-600">
                                +{event.commissionAmount} ₽
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {event.status === "pending" && (
                              <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">
                                В ожидании
                              </span>
                            )}
                            {event.status === "paid" && (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">
                                Начислено
                              </span>
                            )}
                            {event.status === "rejected" && (
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                                Отклонено
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-muted-foreground"
                        >
                          Событий пока нет.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PAYOUTS TAB */}
        <TabsContent value="payouts" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Запрос выплаты</CardTitle>
                <CardDescription>
                  Минимальная сумма: {minPayout.toLocaleString("ru-RU")} ₽.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">
                  {balance.toLocaleString("ru-RU")} ₽
                </div>
                <p className="text-muted-foreground">Текущий баланс</p>

                {!canRequestPayout && (
                  <div className="flex items-start gap-2 text-sm text-amber-700 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Для вывода средств необходимо накопить еще{" "}
                      {(minPayout - balance).toLocaleString("ru-RU")} ₽.
                    </span>
                  </div>
                )}
                {canRequestPayout && !paymentDetails && (
                  <div className="flex items-start gap-2 text-sm text-red-700 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Сначала заполните платежные реквизиты.</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleRequestPayout}
                  disabled={
                    !canRequestPayout ||
                    !paymentDetails ||
                    requestPayoutMutation.isPending
                  }
                  className="w-full sm:w-auto"
                >
                  {requestPayoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Обработка...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" /> Запросить выплату
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Платежные реквизиты</CardTitle>
                <CardDescription>
                  Куда переводить ваше вознаграждение.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="paymentDetails" className="font-semibold">
                  Ваши реквизиты (Карта / СБП / Р/С)
                </Label>
                <Input
                  id="paymentDetails"
                  className="mt-2"
                  placeholder="Например, СБП: +7 (999) 123-45-67 (Сбербанк)"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  disabled={updatePaymentMutation.isPending}
                />
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  onClick={handleSavePaymentDetails}
                  disabled={updatePaymentMutation.isPending || !paymentDetails}
                >
                  {updatePaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Сохранить реквизиты
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
