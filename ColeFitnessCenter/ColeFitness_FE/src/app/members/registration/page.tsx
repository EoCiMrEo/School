"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomDateInput } from "@/components/ui/custom-date-input";
import { CustomPhoneInput } from "@/components/ui/custom-phone-input";

// Define plan types
type MembershipPlan = "basic" | "premium" | "elite";

// Define the schema for form validation with Zod
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  dob: z.string().min(10, "Please enter a valid date of birth (MM/DD/YYYY)."),
  address: z.string().min(5, "Please enter a valid address."),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  height: z.coerce.number().positive("Please enter a valid height in cm."),
  weight: z.coerce.number().positive("Please enter a valid weight in kg."),
  membershipPlan: z.enum(["basic", "premium", "elite"], {
    required_error: "Please select a membership plan.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Define prop types for components
interface StepProps {
  form: ReturnType<typeof useForm<FormValues>>;
  handleNextStep: () => void;
  handlePrevStep?: () => void;
}

interface PlanCardProps {
  title: string;
  price: string;
  value: MembershipPlan;
  field: {
    value: string;
    onChange: (value: string) => void;
  };
}

const STRIPE_CHECKOUT_URLS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BASIC_URL,
  premium: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PREMIUM_URL,
  elite: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ELITE_URL,
} as const;

const handleCheckout = async (membershipPlan: MembershipPlan) => {
  const checkoutUrl = STRIPE_CHECKOUT_URLS[membershipPlan];
  if (checkoutUrl && checkoutUrl.trim().length > 0) {
    window.location.href = checkoutUrl;
  } else {
    toast({
      title: "Error",
      description: "Checkout URL is not configured for this membership plan.",
      variant: "destructive",
    });
  }
};

export default function MultiStepMembershipRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      address: "",
      gender: "male",
      height: 170,
      weight: 70,
      membershipPlan: "basic",
    },
  });

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const onSubmit = async (data: FormValues) => {
    if (step === 3) {
      await handleCheckout(data.membershipPlan);
    }
  };

  return (
    <div className="registration-container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Membership Registration</CardTitle>
          <CardDescription>
            Join FitLife Club and start your fitness journey today!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <StepOne form={form} handleNextStep={handleNextStep} />
              )}
              {step === 2 && (
                <StepTwo
                  form={form}
                  handleNextStep={handleNextStep}
                  handlePrevStep={handlePrevStep}
                />
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function StepOne({ form, handleNextStep }: StepProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Michael" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomDateInput
          form={form}
          name="dob"
          label="Date of Birth"
          placeholder="MM/DD/YYYY"
        />
      </div>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <CustomPhoneInput
        form={form}
        name="phone"
        label="Phone Number"
        placeholder="(XXX) XXX-XXXX"
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input placeholder="170" {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input placeholder="70" {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        onClick={form.handleSubmit(handleNextStep)}
        className="w-full mt-6"
      >
        Next
      </Button>
    </div>
  );
}

function StepTwo({ form, handlePrevStep }: StepProps) {
  const onCheckout = async () => {
    const values = form.getValues();
    await handleCheckout(values.membershipPlan as MembershipPlan);
  };

  return (
    <div>
      <FormField
        control={form.control}
        name="membershipPlan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Choose a Membership Plan</FormLabel>
            <div className="flex flex-col space-y-4 mt-4">
              <PlanCard
                title="Basic Plan"
                price="$29.99/month"
                value="basic"
                field={field}
              />
              <PlanCard
                title="Premium Plan"
                price="$59.99/month"
                value="premium"
                field={field}
              />
              <PlanCard
                title="Elite Plan"
                price="$99.99/month"
                value="elite"
                field={field}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-between mt-6">
        <Button type="button" onClick={handlePrevStep} className="w-1/3">
          Back
        </Button>
        <Button type="button" onClick={onCheckout} className="w-1/3">
          Next
        </Button>
      </div>
    </div>
  );
}

function PlanCard({ title, price, value, field }: PlanCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition ${
        field.value === value ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onClick={() => field.onChange(value)}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{price}</p>
    </div>
  );
}
