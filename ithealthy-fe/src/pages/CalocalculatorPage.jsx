import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { RefreshCcw } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function HomePage() {
  // ===== AUTH =====
  const { user } = useContext(AuthContext);

  // ===== INPUT =====
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [activity, setActivity] = useState(1.2);
  const [result, setResult] = useState(null);

  // ===== MEAL =====
  const [products, setProducts] = useState([]);
  const [meals, setMeals] = useState(null);
  const [lockedCalories, setLockedCalories] = useState(null);

  // ===== LOAD PRODUCTS =====
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products/all-products")
      .then((res) =>
        setProducts(res.data.filter((p) => p.isAvailable && p.calories > 0))
      )
      .catch(() => console.error("Không tải được món ăn"));
  }, []);

  // ===== VALIDATE INPUT =====
  const validateInput = () => {
    if (!age || !height || !weight || !activity) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }
    return true;
  };

  // ===== BMI + BMR + TDEE =====
  const calculateHealth = () => {
    if (!validateInput()) return;

    const h = height / 100;
    const bmi = +(weight / (h * h)).toFixed(1);

    let bmiStatus = "";
    let color = "";

    if (bmi < 18.5) {
      bmiStatus = "Gầy";
      color = "text-blue-500";
    } else if (bmi < 25) {
      bmiStatus = "Bình thường";
      color = "text-green-500";
    } else if (bmi < 30) {
      bmiStatus = "Thừa cân";
      color = "text-yellow-500";
    } else {
      bmiStatus = "Béo phì";
      color = "text-red-500";
    }

    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * activity);

    setResult({
      bmi,
      bmiStatus,
      bmr: Math.round(bmr),
      tdee,
      color,
    });

    setMeals(null);
    setLockedCalories(null);
  };

  // ===== PICK MULTI ITEMS FOR ONE MEAL =====
  const pickMeal = (targetCalories) => {
    if (!products.length) return null;

    const shuffled = [...products].sort(() => Math.random() - 0.5);
    let total = 0;
    let items = [];

    for (const p of shuffled) {
      if (total + p.calories <= targetCalories * 1.1) {
        items.push(p);
        total += p.calories;
      }
      if (total >= targetCalories * 0.9) break;
    }

    if (items.length === 0) return null;

    return {
      items,
      totalCalories: total,
    };
  };

  // ===== GENERATE MEAL PLAN =====
  const generateMealPlan = () => {
    if (!result?.tdee) {
      alert("Vui lòng tính TDEE trước!");
      return;
    }

    const tdee = result.tdee;
    setLockedCalories(tdee);

    const breakfast = pickMeal(tdee * 0.3);
    const lunch = pickMeal(tdee * 0.4);
    const dinner = pickMeal(tdee * 0.3);

    if (!breakfast || !lunch || !dinner) {
      alert("Không đủ món để tạo thực đơn!");
      return;
    }

    setMeals({ breakfast, lunch, dinner });
  };

  // ===== REROLL THEO TỪNG BUỔI =====
  const rerollMeal = (key) => {
    if (!lockedCalories) return;

    const ratio = {
      breakfast: 0.3,
      lunch: 0.4,
      dinner: 0.3,
    };

    const newMeal = pickMeal(lockedCalories * ratio[key]);
    if (!newMeal) return;

    setMeals((prev) => ({ ...prev, [key]: newMeal }));
  };

  // ===== ADD TO CART =====
  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Vui lòng đăng nhập!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        customerId: user.customerId,
        productId: product.productId,
        quantity: 1,
        unitPrice: product.basePrice,
      });

      alert("Đã thêm vào giỏ hàng!");
    } catch {
      alert("Không thể thêm vào giỏ hàng!");
    }
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">
          BMI & Calories Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
            Giới tính
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              onChange={(e) => setGender(e.target.value)}
            >
              
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>

            {[
              ["Tuổi", setAge],
              ["Chiều cao (cm)", setHeight],
              ["Cân nặng (kg)", setWeight],
            ].map(([label, setter], i) => (
              <div className="mb-4" key={i}>
                <label>{label}</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  onChange={(e) => setter(+e.target.value)}
                />
              </div>
            ))}

            Tần suất Vận động
            <select
              className="w-full border px-3 py-2 rounded mb-6"
              onChange={(e) => setActivity(+e.target.value)}
            >
              <option value="1.2">Ít</option>
              <option value="1.375">Nhẹ</option>
              <option value="1.55">Vừa</option>
              <option value="1.725">Nhiều</option>
            </select>

            <button
              onClick={calculateHealth}
              className="w-full bg-blue-500 text-white py-3 rounded-xl"
            >
              Tính toán
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow text-center">
              {result ? (
                <>
                  <p className={`text-3xl font-bold ${result.color}`}>
                    BMI: {result.bmi}
                  </p>
                  <p>{result.bmiStatus}</p>
                  <p>BMR: {result.bmr} kcal</p>
                  <p className="font-bold text-green-600">
                    TDEE: {result.tdee} kcal/ngày
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Nhập thông tin để xem kết quả
                </p>
              )}
            </div>

            {result && (
              <>
                <button
                  onClick={generateMealPlan}
                  className="w-full bg-green-500 text-white py-3 rounded-xl"
                >
                  Tạo thực đơn
                </button>

                {meals &&
                  Object.entries(meals).map(([key, meal]) => (
                    <div
                      key={key}
                      className="bg-white rounded-2xl p-5 shadow"
                    >
                      <div className="flex justify-between mb-3">
                        <h3 className="font-bold capitalize">
                          🍽️ {key}
                        </h3>
                        <button
                          onClick={() => rerollMeal(key)}
                          className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center"
                        >
                          <RefreshCcw size={16} />
                        </button>
                      </div>

                      {meal.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-3 mb-3"
                        >
                          <img
                            src={item.imageProduct}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2"> {item.descriptionProduct} </p>
                            <p className="text-sm text-gray-500">
                              🔥 {item.calories} kcal | 💪 {item.protein}g
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="text-orange-500 font-bold"
                          >
                            +
                          </button>
                        </div>
                      ))}

                      <div className="text-right font-bold text-green-600">
                        Tổng: {Math.round(meal.totalCalories)} kcal
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
