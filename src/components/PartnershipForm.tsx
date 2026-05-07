"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitPartnership } from "@/services/dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function PartnershipForm() {
  const { toast } = useToast();
  const submitMutation = useSubmitPartnership();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    website: "",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Phone Mask Logic: +7 (999) 999-99-99
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Strip non-digits

    // Auto-detect standard Russian prefixes
    if (value.startsWith("7") || value.startsWith("8")) {
      value = value.slice(1);
    }

    let formattedValue = "";
    if (value.length > 0) formattedValue += "+7 ";
    if (value.length > 0) formattedValue += "(" + value.substring(0, 3);
    if (value.length >= 4) formattedValue += ") " + value.substring(3, 6);
    if (value.length >= 7) formattedValue += "-" + value.substring(6, 8);
    if (value.length >= 9) formattedValue += "-" + value.substring(8, 10);

    setFormData({ ...formData, phone: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.message || "Не удалось отправить заявку.",
        });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center py-10 animate-in zoom-in duration-500">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Заявка принята!</h3>
        <p className="text-muted-foreground">
          Спасибо за интерес. Наш менеджер свяжется с вами в ближайшее время по
          указанным контактам.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">
          Ваше имя / Название компании <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            required
            placeholder="Иван Иванов"
            className="pl-10"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            required
            placeholder="ivan@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Телефон <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              required
              placeholder="+7 (999) 000-00-00"
              className="pl-10"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength={18} // Prevents typing infinitely past the mask
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            Город <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              required
              placeholder="Москва"
              className="pl-10"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">
          Сайт или соц. сеть{" "}
          <span className="text-muted-foreground font-normal">
            (необязательно)
          </span>
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            placeholder="https://t.me/yourchannel"
            className="pl-10"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base mt-2"
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Отправка...
          </>
        ) : (
          "Отправить заявку"
        )}
      </Button>
    </form>
  );
}
