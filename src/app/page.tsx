"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const float: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function PartnerLandingPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="flex flex-col min-h-screen bg-background w-full overflow-hidden">
      {/* =========================================================
          HERO SECTION (Dark/Elegant with Animated Data)
          ========================================================= */}
      <section className="relative w-full min-h-[80vh] md:min-h-[90vh] flex items-center pt-20 pb-16 lg:pt-28 lg:pb-24 bg-slate-950 text-white overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* HERO TEXT */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-slate-200">
                  Платформа для профессионалов
                </span>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h1 className="text-3xl md:text-5xl xxl:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                  Масштабируйте свой <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    ивент-бизнес
                  </span>{" "}
                  с нами
                </h1>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed"
              >
                Eventomir объединяет организаторов мероприятий, артистов,
                рестораны и площадки с тысячами клиентов ежедневно. Увеличьте
                свою выручку без скрытых комиссий и абонентской платы.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center gap-2">
                      Перейти в Дашборд
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(var(--primary),0.4)] flex items-center justify-center gap-2">
                      Стать партнером
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                )}
                <Link href="#benefits">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all backdrop-blur-md flex items-center justify-center">
                    Узнать больше
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* HERO ANIMATED DATA GRAPHICS */}
            <div className="relative h-[400px] lg:h-[500px] hidden md:block">
              {/* Floating Card 1 */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={float}
                className="absolute top-10 right-10 p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl w-64 z-20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Рост выручки
                    </p>
                    <p className="text-xl font-bold text-white">+145%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full w-[85%]"></div>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={float}
                transition={{
                  delay: 0.5,
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-20 left-10 p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl w-72 z-30"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Новые заявки
                    </p>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <p className="text-xs text-slate-300">
                      Корпоратив на 50 чел.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <p className="text-xs text-slate-300">Свадебный банкет</p>
                  </div>
                </div>
              </motion.div>

              {/* Center Main Graphic (Abstract UI) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-primary/40 to-blue-600/40 rounded-full blur-2xl z-0"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[360px] bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-2xl shadow-2xl z-10 p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-sm">Дашборд</h3>
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full bg-slate-800/50 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-slate-700/50 rounded w-full"></div>
                        <div className="h-2 bg-slate-700/50 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENEFITS SECTION
          ========================================================= */}
      <section id="benefits" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight"
            >
              Почему выбирают Eventomir?
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-lg text-slate-600"
            >
              Мы создали экосистему, в которой ваш бизнес стабильно получает
              новых клиентов без лишних затрат на маркетинг.
            </motion.p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Benefit 1 */}
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Огромная аудитория
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Получите доступ к тысячам заказчиков, которые ежедневно ищут
                исполнителей и площадки для своих мероприятий на нашей
                платформе.
              </p>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                <Wallet className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Никаких скрытых сборов
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Вы платите только небольшую комиссию за реально закрытые сделки.
                Никакой абонентской платы или оплаты за пустые просмотры.
              </p>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Мощная аналитика
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Отслеживайте статистику просмотров, конверсию в заказы и свои
                доходы в режиме реального времени через удобный партнерский
                кабинет.
              </p>
            </motion.div>

            {/* Benefit 4 */}
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
                <CalendarCheck className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Управление бронированием
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Встроенный календарь позволяет легко управлять занятостью,
                избегать накладок и автоматически принимать новые заявки на
                свободные даты.
              </p>
            </motion.div>

            {/* Benefit 5 */}
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Безопасные сделки
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Все расчеты защищены. Мы гарантируем своевременные выплаты и
                помогаем в разрешении спорных ситуаций с клиентами.
              </p>
            </motion.div>

            {/* CTA Card inside grid */}
            <motion.div
              variants={fadeUp}
              className="bg-primary p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">
                Готовы начать?
              </h3>
              <p className="text-primary-foreground/80 mb-6 relative z-10">
                Регистрация займет не более 2 минут. Создайте профиль и
                получайте заказы уже сегодня.
              </p>

              {!isLoggedIn && (
                <Link href="/register" className="relative z-10">
                  <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    Создать аккаунт
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS (Simple Steps)
          ========================================================= */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight"
              >
                Как это работает
              </motion.h2>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Зарегистрируйтесь",
                    desc: "Заполните данные о вашей компании или услугах.",
                  },
                  {
                    step: "2",
                    title: "Оформите профиль",
                    desc: "Добавьте красивые фото, описание и прайс-лист.",
                  },
                  {
                    step: "3",
                    title: "Получайте заявки",
                    desc: "Клиенты сами находят вас и отправляют запросы.",
                  },
                  {
                    step: "4",
                    title: "Зарабатывайте",
                    desc: "Успешно проводите мероприятия и выводите средства.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-100 rounded-3xl aspect-square md:aspect-[4/3] p-8 relative overflow-hidden"
              >
                {/* Mock UI for "How it works" */}
                <div className="absolute inset-x-8 -bottom-10 h-full bg-white rounded-t-xl shadow-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div>
                        <div className="h-3 w-24 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      Новый заказ
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                    <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
                    <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <div className="h-10 flex-1 bg-primary rounded-lg"></div>
                    <div className="h-10 flex-1 bg-slate-100 rounded-lg"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BOTTOM CTA SECTION
          ========================================================= */}
      {!isLoggedIn && (
        <section className="py-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white mb-6"
            >
              Начните зарабатывать больше с Eventomir
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-primary-foreground/80 text-md md:text-lg max-w-3xl mx-auto mb-10"
            >
              Присоединяйтесь к сообществу профессионалов ивент-индустрии прямо
              сейчас.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/register">
                <button className="px-10 py-5 bg-white text-primary text-lg font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2 mx-auto">
                  Создать аккаунт бесплатно
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
