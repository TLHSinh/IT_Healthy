import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Wallet, CreditCard, Truck } from "lucide-react";

const PaymentMethodSelector = () => {
  const [selectedMethod, setSelectedMethod] = useState("cod");

  const handleConfirm = () => {
    console.log("Phương thức thanh toán đã chọn:", selectedMethod);
    alert(`Bạn đã chọn thanh toán bằng: ${getMethodLabel(selectedMethod)}`);
    // 🔜 Sau này chèn API thanh toán ở đây
  };

  const getMethodLabel = (value) => {
    switch (value) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "momo":
        return "Momo";
      case "vnpay":
        return "VNPay";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Chọn phương thức thanh toán
      </h2>

      <RadioGroup
        value={selectedMethod}
        onValueChange={setSelectedMethod}
        className="space-y-4"
      >
        {[
          {
            value: "cod",
            label: "Thanh toán khi nhận hàng (COD)",
            icon: Truck,
          },
          { value: "momo", label: "Ví điện tử Momo", icon: Wallet },
          { value: "vnpay", label: "VNPay", icon: CreditCard },
        ].map(({ value, label, icon: Icon }) => (
          <Card
            key={value}
            onClick={() => setSelectedMethod(value)}
            className={`cursor-pointer transition border-2 ${
              selectedMethod === value
                ? "border-blue-500 shadow-lg"
                : "border-gray-200"
            }`}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <RadioGroupItem value={value} id={value} />
              <Icon className="w-6 h-6 text-blue-600" />
              <label htmlFor={value} className="flex-1 cursor-pointer">
                {label}
              </label>
              {selectedMethod === value && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      <Button
        onClick={handleConfirm}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
      >
        Xác nhận thanh toán
      </Button>
    </div>
  );
};

export default PaymentMethodSelector;
