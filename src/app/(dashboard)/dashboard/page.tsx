"use client";

import { useEffect, useRef } from "react";
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

// ONLY import Dashboard related services
import { usePartnerDashboard, useRequestPayout } from "@/services/dashboard";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
    <Skeleton className="h-80 rounded-xl" />
  </div>
);

export default function PartnerDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("v");
  const hasAttemptedTransfer = useRef(false);

  const mainAppUrl =
    process.env.NEXT_PUBLIC_WEB_APP_URL || "https://app.eventomir.ru";
  const userId = session?.user?.id;

  // --- Auth & Transfer Logic ---
  useEffect(() => {
    if (token && !hasAttemptedTransfer.current) {
      hasAttemptedTransfer.current = true;
      signIn("credentials", { transferToken: token, redirect: false }).then(
        (res) => {
          if (res?.ok) router.replace("/dashboard");
          else {
            toast({
              variant: "destructive",
              title: "Ошибка",
              description: "Срок действия ссылки истек.",
            });
            window.location.href = `${mainAppUrl}/login`;
          }
        },
      );
    } else if (status === "unauthenticated" && !token) {
      window.location.href = `${mainAppUrl}/login`;
    }
  }, [token, status, router, mainAppUrl, toast]);

  const isReadyToFetch =
    status === "authenticated" && !!userId && session?.user?.role === "partner";

  // --- Data Hooks ---
  const {
    data: dashboardData,
    isLoading,
    error,
  } = usePartnerDashboard(isReadyToFetch ? userId : undefined);
  const requestPayoutMutation = useRequestPayout();

  if (
    status === "loading" ||
    (token && !hasAttemptedTransfer.current) ||
    isLoading
  ) {
    return (
      // Added pt-28 to clear the fixed header
      <div className="container mx-auto pt-28 pb-10 max-w-6xl">
        <DashboardSkeleton />
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "partner") {
    return (
      <div className="container mx-auto pt-32 pb-20 text-center max-w-xl">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Доступ запрещен</h2>
        <Button
          className="mt-6"
          onClick={() => (window.location.href = mainAppUrl)}
        >
          Вернуться
        </Button>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto pt-32 pb-20 text-center max-w-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Ошибка загрузки данных</h2>
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
    paymentDetails,
  } = dashboardData;
  const canRequestPayout = balance >= minPayout;

  const handleCopyToClipboard = () => {
    if (!dashboardData) return;
    const referralLink = `${mainAppUrl}/register-performer?ref=${referralId}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Скопировано!",
      description: "Реферальная ссылка скопирована в буфер обмена.",
    });
  };

  return (
    <div className="container mx-auto pt-24 pb-12 md:pt-32 md:pb-20 space-y-8 max-w-6xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Кабинет партнера
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Отслеживайте статистику и управляйте финансами.
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white shadow-sm overflow-hidden">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-6 md:p-8">
          <div className="flex-grow w-full">
            <Label
              htmlFor="referralLink"
              className="text-emerald-800 font-bold mb-2 block text-sm uppercase tracking-wider"
            >
              Ваша уникальная реферальная ссылка
            </Label>
            <Input
              id="referralLink"
              readOnly
              className="bg-white border-emerald-200 font-mono text-base py-6 shadow-sm focus-visible:ring-emerald-500"
              value={`${mainAppUrl}/register-performer?ref=${referralId}`}
            />
          </div>
          <Button
            size="lg"
            onClick={handleCopyToClipboard}
            className="w-full sm:w-auto mt-2 sm:mt-0 shrink-0 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105"
          >
            <Copy className="mr-2 h-5 w-5" /> Скопировать
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            Обзор
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg">
            События
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-lg">
            Выплаты
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-emerald-600">
                  {balance.toLocaleString("ru-RU")} ₽
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-blue-500" /> Заработано
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {totalEarned.toLocaleString("ru-RU")} ₽
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" /> Регистраций
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  +{totalRegistrations}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-500" /> Переходов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {clicks}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Доход по месяцам</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer
                config={{
                  total: { label: "Доход (₽)", color: "hsl(var(--primary))" },
                }}
                className="h-full w-full"
              >
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

        {/* EVENTS TAB */}
        <TabsContent value="events" className="mt-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle>События</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full">
                <Table>
                  <TableHeader className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="font-bold">Дата</TableHead>
                      <TableHead className="font-bold">Событие</TableHead>
                      <TableHead className="font-bold">Пользователь</TableHead>
                      <TableHead className="text-right font-bold">
                        Сумма
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        Статус
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralEvents?.map((event: any) => (
                      <TableRow
                        key={event.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(event.createdAt).toLocaleDateString(
                            "ru-RU",
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.eventType === "registration"
                            ? "Регистрация"
                            : "Оплата"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {event.referredUserId.substring(0, 8)}***
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {event.commissionAmount ? (
                            <span className="text-emerald-600">
                              +{event.commissionAmount} ₽
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {event.status === "paid" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              Оплачено
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              Ожидание
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!referralEvents || referralEvents.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-48 text-center text-muted-foreground"
                        >
                          Событий пока нет. Приглашайте пользователей!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUTS TAB */}
        <TabsContent value="payouts" className="mt-6">
          <Card className="max-w-xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle>Запрос выплаты</CardTitle>
              <CardDescription>
                Минимальная сумма: {minPayout.toLocaleString("ru-RU")} ₽.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Доступно к выводу
                </p>
                <div className="text-5xl font-black text-slate-900 tracking-tight">
                  {balance.toLocaleString("ru-RU")}{" "}
                  <span className="text-3xl text-slate-400 font-bold">₽</span>
                </div>
              </div>

              {!canRequestPayout && (
                <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                  <p>
                    Для вывода средств необходимо накопить еще{" "}
                    <strong className="font-bold">
                      {(minPayout - balance).toLocaleString("ru-RU")} ₽
                    </strong>
                    .
                  </p>
                </div>
              )}
              {canRequestPayout && !paymentDetails && (
                <div className="flex items-start gap-3 text-sm text-red-800 bg-red-50 p-4 rounded-xl border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                  <p>
                    Укажите ваши банковские реквизиты в настройках профиля перед
                    запросом выплаты.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-6">
              <Button
                size="lg"
                className="w-full sm:w-auto font-bold shadow-md hover:shadow-lg transition-all"
                onClick={() => requestPayoutMutation.mutate(userId!)}
                disabled={
                  !canRequestPayout ||
                  !paymentDetails ||
                  requestPayoutMutation.isPending
                }
              >
                {requestPayoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-5 w-5" />
                )}
                Оформить заявку на вывод
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
