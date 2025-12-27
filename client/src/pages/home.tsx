import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Shield, 
  Clock, 
  Thermometer, 
  Menu, 
  X, 
  Calendar, 
  Package, 
  CreditCard, 
  RefreshCw,
  Wind,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { rentalPeriods } from "@shared/schema";

const formSchema = z.object({
  name: z.string()
    .min(1, "이름을 입력해주세요")
    .regex(/^[가-힣]{3,4}$/, "한글 3-4글자만 입력 가능합니다"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  startDate: z.string().min(1, "대여 시작일을 선택해주세요"),
  endDate: z.string().min(1, "반납 예정일을 선택해주세요"),
  rentalPeriod: z.string().min(1, "대여 기간을 선택해주세요"),
  additionalRequests: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const navItems = [
  { id: "home", label: "홈" },
  { id: "usage", label: "난로사용법" },
  { id: "rental", label: "빌리는법" },
  { id: "apply", label: "신청" },
];

const features = [
  { 
    icon: Shield, 
    title: "안전인증", 
    description: "완벽한 안전 검사" 
  },
  { 
    icon: Clock, 
    title: "빠른 대여", 
    description: "당일 픽업 가능" 
  },
  { 
    icon: Thermometer, 
    title: "강력한 난방", 
    description: "효율적인 열효율" 
  },
  { 
    icon: Flame, 
    title: "다양한 종류", 
    description: "캠핑 스타일별" 
  },
];

const processSteps = [
  { 
    step: 1, 
    icon: Calendar, 
    title: "날짜 선택", 
    description: "캠핑 일정에 맞춰 대여 기간을 선택하세요" 
  },
  { 
    step: 2, 
    icon: Package, 
    title: "난로 선택", 
    description: "캠핑 인원과 스타일에 맞는 난로를 고르세요" 
  },
  { 
    step: 3, 
    icon: CreditCard, 
    title: "결제 완료", 
    description: "온라인으로 간편하게 결제를 진행하세요" 
  },
  { 
    step: 4, 
    icon: RefreshCw, 
    title: "픽업/반납", 
    description: "예약한 날짜에 픽업하고 사용 후 반납하세요" 
  },
];

const ignitionSteps = [
  "난로를 평평하고 안전한 곳에 설치합니다",
  "연료통을 확인하고 연료를 충분히 채웁니다",
  "점화 장치를 사용하여 안전하게 점화합니다",
  "불꽃이 안정될 때까지 기다립니다",
];

const ventilationSteps = [
  "텐트 내부 사용 시 반드시 환기구를 열어둡니다",
  "1시간마다 충분한 환기를 실시합니다",
  "일산화탄소 감지기를 함께 사용하세요",
  "취침 전 반드시 난로를 끄고 환기합니다",
];

const safetyWarnings = [
  "난로 주변 1m 이내에는 인화성 물질을 두지 마세요",
  "어린이나 반려동물이 접근하지 않도록 주의하세요",
  "연료 보충 시 반드시 불을 완전히 끄고 식힌 후 진행하세요",
  "밀폐된 공간에서 장시간 사용을 금지합니다",
];

const pricingOptions = [
  { type: "기본형 난로", price: "15,000원", period: "1박 2일 기준" },
  { type: "프리미엄 난로", price: "25,000원", period: "1박 2일 기준" },
  { type: "대형 난로", price: "35,000원", period: "1박 2일 기준" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await fetch('/api/reserved-dates');
        const data = await response.json();
        setReservedDates(data.reservedDates || []);
      } catch (error) {
        console.error('Failed to fetch reserved dates:', error);
      }
    };
    fetchReservedDates();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      startDate: "",
      endDate: "",
      rentalPeriod: "1night2days",
      additionalRequests: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/rental-applications", data);
    },
    onSuccess: async () => {
      toast({
        title: "신청 완료",
        description: "대여 신청이 완료되었습니다. 빠르게 연락드리겠습니다.",
      });
      form.reset();
      
      // Refresh reserved dates
      try {
        const response = await fetch('/api/reserved-dates');
        const data = await response.json();
        setReservedDates(data.reservedDates || []);
      } catch (error) {
        console.error('Failed to refresh reserved dates:', error);
      }
    },
    onError: (error: any) => {
      const message = error?.message || "신청 중 오류가 발생했습니다. 다시 시도해주세요.";
      toast({
        title: "신청 실패",
        description: message,
        variant: "destructive",
      });
    },
  });

  const isDateInReserved = (date: string) => {
    return reservedDates.includes(date);
  };

  const isRangeOverlapping = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (isDateInReserved(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const onSubmit = (data: FormData) => {
    // Validate date range before submission
    if (isRangeOverlapping(data.startDate, data.endDate)) {
      toast({
        title: "예약 불가",
        description: "선택한 기간에 이미 예약된 날짜가 포함되어 있습니다. 다른 날짜를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate(data);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4]">
      <header className="sticky top-0 z-50 bg-[#F9F8F4]/95 backdrop-blur-sm border-b border-[#E5E3DD]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={() => scrollToSection("home")}
              className="flex items-center gap-2"
              data-testid="link-logo"
            >
              <div className="w-10 h-10 rounded-full bg-[#654E32] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#654E32]">캠핑난로</span>
            </button>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-[#222222] hover:text-[#654E32] transition-colors font-medium"
                  data-testid={`link-nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#F9F8F4] border-t border-[#E5E3DD]"
            >
              <nav className="flex flex-col p-4 gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left py-3 px-4 text-[#222222] hover:bg-[#EBE9E4] rounded-lg transition-colors font-medium"
                    data-testid={`link-mobile-nav-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section id="home" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-[#222222] mb-6"
            data-testid="text-hero-title"
          >
            따뜻한 캠핑의 시작
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-[#666666] mb-10 max-w-xl mx-auto"
            data-testid="text-hero-subtitle"
          >
            안전하고 편리한 캠핑난로 대여 서비스로 추운 겨울에도 따뜻한 캠핑을 즐기세요
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => scrollToSection("apply")}
              className="w-full sm:w-auto px-8 py-6 bg-[#654E32] hover:bg-[#4D3B26] text-white font-medium text-base"
              data-testid="button-apply-now"
            >
              지금 신청하기
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("usage")}
              className="w-full sm:w-auto px-8 py-6 border-[#999999] text-[#666666] hover:bg-[#EBE9E4] font-medium text-base"
              data-testid="button-view-usage"
            >
              사용법 보기
            </Button>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-6 bg-white border-0 shadow-md text-center hover-elevate">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[#654E32]" />
                </div>
                <h3 className="font-semibold text-[#222222] mb-1" data-testid={`text-feature-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-[#888888]">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="usage" className="py-16 md:py-24 px-4 bg-[#F9F8F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#222222] mb-4" data-testid="text-usage-title">
              난로 사용법
            </h2>
            <p className="text-[#666666]">
              안전하고 올바른 난로 사용을 위한 가이드입니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 md:p-8 bg-white border-0 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-[#654E32]" />
                </div>
                <h3 className="text-xl font-semibold text-[#222222]">점화 방법</h3>
              </div>
              <ol className="space-y-3">
                {ignitionSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#654E32] font-semibold">{index + 1}.</span>
                    <span className="text-[#444444]">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 md:p-8 bg-white border-0 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                  <Wind className="w-5 h-5 text-[#654E32]" />
                </div>
                <h3 className="text-xl font-semibold text-[#222222]">환기 관리</h3>
              </div>
              <ol className="space-y-3">
                {ventilationSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#654E32] font-semibold">{index + 1}.</span>
                    <span className="text-[#444444]">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-[#FDF2F2] border-0">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FECACA] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <h3 className="text-xl font-semibold text-[#222222]">안전 주의사항</h3>
            </div>
            <ul className="space-y-3">
              {safetyWarnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#654E32] flex-shrink-0 mt-0.5" />
                  <span className="text-[#444444]">{warning}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section id="rental" className="py-16 md:py-24 px-4 bg-[#F9F8F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#222222] mb-4" data-testid="text-rental-title">
              빌리는 법
            </h2>
            <p className="text-[#666666]">
              간편한 4단계로 난로를 대여하실 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {processSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-5 md:p-6 bg-white border-0 shadow-md h-full">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#654E32]" />
                  </div>
                  <p className="text-[#654E32] text-sm font-semibold mb-2">STEP {item.step}</p>
                  <h3 className="font-semibold text-[#222222] mb-2" data-testid={`text-step-${item.step}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#888888]">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-6 md:p-8 bg-[#EBE9E4] border-0">
            <h3 className="text-xl font-semibold text-[#222222] mb-6" data-testid="text-pricing-title">
              대여 요금 안내
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingOptions.map((option, index) => (
                <div key={index} className="text-center md:text-left">
                  <p className="text-sm text-[#666666] mb-1">{option.type}</p>
                  <p className="text-3xl md:text-4xl font-bold text-[#222222] mb-1" data-testid={`text-price-${index}`}>
                    {option.price}
                  </p>
                  <p className="text-sm text-[#888888]">{option.period}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="apply" className="py-16 md:py-24 px-4 bg-[#F9F8F4]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-[#222222] mb-4" data-testid="text-apply-title">
              대여 신청
            </h2>
            <p className="text-[#666666]">
              아래 양식을 작성하시면 빠르게 연락드리겠습니다
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-white border-0 shadow-lg rounded-xl">
            <h3 className="text-xl font-semibold text-[#222222] mb-6">신청서 작성</h3>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#222222]">
                          이름 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="홍길동" 
                            className="h-12 bg-[#F9F8F4] border-[#E5E3DD] focus:border-[#654E32]"
                            data-testid="input-name"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 4) {
                                field.onChange(value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.replace(/[^가-힣]/g, '');
                              field.onChange(value);
                              field.onBlur();
                            }}
                            name={field.name}
                            ref={field.ref}
                            maxLength={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#222222]">
                          연락처 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="010-0000-0000" 
                            type="tel"
                            className="h-12 bg-[#F9F8F4] border-[#E5E3DD] focus:border-[#654E32]"
                            data-testid="input-phone"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length <= 11) {
                                let formatted = value;
                                if (value.length > 3) {
                                  formatted = value.slice(0, 3) + '-' + value.slice(3);
                                }
                                if (value.length > 7) {
                                  formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
                                }
                                field.onChange(formatted);
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#222222] flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          대여 시작일 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-12 bg-[#F9F8F4] border-[#E5E3DD] focus:border-[#654E32]"
                            data-testid="input-start-date"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              
                              // Calculate rental period if both dates are selected
                              const endDate = form.getValues("endDate");
                              if (e.target.value && endDate) {
                                const start = new Date(e.target.value);
                                const end = new Date(endDate);
                                const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                
                                if (nights === 1) {
                                  form.setValue("rentalPeriod", "1night2days");
                                } else if (nights === 2) {
                                  form.setValue("rentalPeriod", "2nights3days");
                                } else if (nights === 3) {
                                  form.setValue("rentalPeriod", "3nights4days");
                                } else if (nights >= 4) {
                                  form.setValue("rentalPeriod", "4nightsPlus");
                                }
                              }
                              
                              // Auto-focus end date input after selecting start date
                              setTimeout(() => {
                                const endDateInput = document.querySelector('[data-testid="input-end-date"]') as HTMLInputElement;
                                if (endDateInput) {
                                  endDateInput.focus();
                                  endDateInput.click();
                                }
                              }, 100);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            style={{
                              colorScheme: 'light'
                            }}
                          />
                        </FormControl>
                        {reservedDates.length > 0 && (
                          <p className="text-xs text-[#666666]">
                            파란색 날짜는 이미 예약되어 선택할 수 없습니다
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#222222] flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          반납 예정일 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-12 bg-[#F9F8F4] border-[#E5E3DD] focus:border-[#654E32]"
                            data-testid="input-end-date"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              
                              // Calculate rental period if both dates are selected
                              const startDate = form.getValues("startDate");
                              if (startDate && e.target.value) {
                                const start = new Date(startDate);
                                const end = new Date(e.target.value);
                                const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                
                                if (nights === 1) {
                                  form.setValue("rentalPeriod", "1night2days");
                                } else if (nights === 2) {
                                  form.setValue("rentalPeriod", "2nights3days");
                                } else if (nights === 3) {
                                  form.setValue("rentalPeriod", "3nights4days");
                                } else if (nights >= 4) {
                                  form.setValue("rentalPeriod", "4nightsPlus");
                                }
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            style={{
                              colorScheme: 'light'
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rentalPeriod"
                  render={({ field }) => {
                    const startDate = form.watch("startDate");
                    const endDate = form.watch("endDate");
                    
                    let displayText = "대여 기간을 선택하세요";
                    if (startDate && endDate) {
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      
                      const period = rentalPeriods.find(p => {
                        if (nights === 1 && p.value === "1night2days") return true;
                        if (nights === 2 && p.value === "2nights3days") return true;
                        if (nights === 3 && p.value === "3nights4days") return true;
                        if (nights >= 4 && p.value === "4nightsPlus") return true;
                        return false;
                      });
                      
                      displayText = period ? period.label : displayText;
                    }
                    
                    return (
                      <FormItem>
                        <FormLabel className="font-semibold text-[#222222]">
                          대여 기간 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div 
                            className="h-12 bg-[#EBE9E4] border border-[#E5E3DD] rounded-md px-3 flex items-center text-[#222222]"
                            data-testid="select-rental-period"
                          >
                            {displayText}
                          </div>
                        </FormControl>
                        <input type="hidden" {...field} />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="additionalRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#222222]">추가 요청사항</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="픽업 시간, 특별 요청사항 등을 자유롭게 작성해주세요"
                          className="min-h-[150px] bg-[#F9F8F4] border-[#E5E3DD] focus:border-[#654E32] resize-none"
                          data-testid="textarea-additional"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-14 bg-[#654E32] hover:bg-[#4D3B26] text-white font-semibold text-lg"
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "신청 중..." : "신청하기"}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="text-center mt-8 py-4">
            <p className="text-[#666666]">
              문의사항이 있으시면 언제든지 연락주세요
              <br className="md:hidden" />
              <span className="hidden md:inline"> · </span>
              <a 
                href="https://open.kakao.com/o/sUqjDx8h" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-[#654E32] hover:underline"
              >
                오픈카카오톡방 문의
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-[#E5E3DD]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#654E32] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-[#654E32]">캠핑난로</span>
              </div>
              <p className="text-sm text-[#666666]">
                안전하고 편리한 캠핑난로 대여 서비스로 따뜻한 캠핑을 즐기세요
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#222222] mb-4">고객센터</h4>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  전화: 1588-0000
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  이메일: info@camping-heater.com
                </li>
                <li>운영시간: 평일 09:00 - 18:00</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#222222] mb-4">픽업/반납 장소</h4>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  서울특별시 강남구 테헤란로 123
                </li>
                <li className="pl-6">캠핑난로 대여센터 1층</li>
                <li className="pl-6">주차 가능 (무료)</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-[#E5E3DD]">
            <p className="text-sm text-[#888888]" data-testid="text-copyright">
              © 2025 캠핑난로. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}