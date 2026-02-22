import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Target, Banknote, BarChart } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import PartnershipForm from "@/components/PartnershipForm";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Партнерская программа | Eventomir",
  description:
    "Присоединяйтесь к нашей партнерской программе и зарабатывайте вместе с нами.",
};

const AdvantageCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="text-center shadow-sm hover:shadow-xl transition-all duration-300 border-border/50 bg-card hover:-translate-y-1">
    <CardHeader className="pb-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <CardTitle className="text-xl font-bold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </CardContent>
  </Card>
);

export default async function PartnershipLandingPage() {
  const session = await getServerSession(authOptions);
  const isPartner = session?.user?.role === "partner";

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 text-center bg-gradient-to-b from-primary/10 via-background to-background px-4 overflow-hidden">
        {/* Important: Added mx-auto for perfect centering */}
        <div className="container mx-auto max-w-4xl relative z-10">
          <Badge
            variant="outline"
            className="mb-6 bg-background/80 backdrop-blur-sm border-primary/20 text-primary px-4 py-1.5 text-sm"
          >
            Партнерская программа 2026
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground mb-6 leading-tight">
            Зарабатывайте на привлечении{" "}
            <span className="text-primary">исполнителей</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Eventomir предлагает прозрачную систему монетизации. Привлекайте
            фотографов, ведущих и диджеев на платформу и получайте высокий
            процент с их оплат.
          </p>
          {!isPartner && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#register-form">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                >
                  Начать зарабатывать
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Почему это выгодно?
            </h2>
            <p className="text-muted-foreground text-lg">
              Мы создали лучшие условия на рынке для наших партнеров, чтобы ваш
              доход рос вместе с платформой.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            <AdvantageCard
              icon={<Banknote className="h-8 w-8" />}
              title="Щедрые выплаты"
            >
              Получайте конкурентоспособный процент от каждой первой оплаты
              тарифа привлеченным вами исполнителем.
            </AdvantageCard>
            <AdvantageCard
              icon={<Target className="h-8 w-8" />}
              title="Прозрачная статистика"
            >
              Уникальные реферальные ссылки и детальная аналитика по кликам и
              конверсиям в личном кабинете.
            </AdvantageCard>
            <AdvantageCard
              icon={<BarChart className="h-8 w-8" />}
              title="Готовые промо-материалы"
            >
              Используйте наши готовые баннеры, креативы и тексты для легкого
              старта и эффективного привлечения.
            </AdvantageCard>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      {!isPartner && (
        <section
          id="register-form"
          className="py-24 bg-background relative overflow-hidden"
        >
          {/* Decorative Background Element */}
          <div className="absolute inset-0 bg-primary/5 -skew-y-2 z-0 transform origin-top-left"></div>

          <div className="container mx-auto max-w-xl px-4 relative z-10">
            <Card className="shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-3xl font-bold">
                  Стать партнером
                </CardTitle>
                <CardDescription className="text-base mt-3 text-muted-foreground">
                  Заполните форму, и мы создадим вам личный кабинет для старта
                  заработка.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-10 pt-0">
                <PartnershipForm />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
