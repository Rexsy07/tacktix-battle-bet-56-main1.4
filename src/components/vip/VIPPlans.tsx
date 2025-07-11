
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const VIPPlans = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: "basic",
      name: "Basic VIP",
      price: 5000,
      duration: "1 month",
      icon: Star,
      features: [
        "Reduced transaction fees (1.5% → 1%)",
        "Priority customer support",
        "VIP badge on profile",
        "Access to VIP-only tournaments"
      ],
      popular: false
    },
    {
      id: "premium",
      name: "Premium VIP",
      price: 12000,
      duration: "3 months",
      icon: Crown,
      features: [
        "All Basic VIP features",
        "Reduced transaction fees (1.5% → 0.5%)",
        "Early access to new features",
        "Monthly bonus rewards",
        "Advanced analytics dashboard"
      ],
      popular: true
    },
    {
      id: "elite",
      name: "Elite VIP",
      price: 20000,
      duration: "6 months",
      icon: Zap,
      features: [
        "All Premium VIP features",
        "Zero transaction fees",
        "Dedicated account manager",
        "Exclusive elite tournaments",
        "Custom profile themes",
        "Priority dispute resolution"
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string, price: number) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe to VIP",
          variant: "destructive",
        });
        return;
      }

      // Create a VIP subscription transaction
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          type: "vip_subscription",
          amount: price,
          status: "completed",
          description: `VIP subscription - ${planId}`
        } as any);

      if (error) throw error;

      // Update user profile to VIP status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_vip: true })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Subscription Successful",
        description: "Welcome to VIP! Your benefits are now active.",
      });

    } catch (error) {
      console.error("Error subscribing to VIP:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">VIP Membership Plans</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock exclusive features, reduced fees, and premium support with our VIP membership plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-tacktix-blue' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-tacktix-blue text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-tacktix-blue/10 flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-tacktix-blue" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-tacktix-blue">
                  ₦{plan.price.toLocaleString()}
                </div>
                <p className="text-gray-400">per {plan.duration}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VIPPlans;
