import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react';

const MealCard = ({ meal }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[360px] flex-shrink-0">
      {/* Image Container */}
      <div className="relative mb-4">
        <div className="w-full h-72 rounded-xl overflow-hidden bg-gray-100">
          <img 
            src={meal.imageProduct || '/api/placeholder/400/320'} 
            alt={meal.productName}
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Icon Badge */}
        <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center ${
          meal.badge === 'chef' ? 'bg-yellow-400' : 'bg-red-400'
        }`}>
          {meal.badge === 'chef' ? (
            <ChefHat className="w-6 h-6 text-white" />
          ) : (
            <Clock className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Meal Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{meal.code || 'B1'}</h3>
          <span className="px-4 py-1 bg-gray-100 rounded-full text-sm font-semibold">
            {meal.calories || 0} CALORIES
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {meal.descriptionProduct || meal.ingredients?.join(', ')}
        </p>
      </div>

      {/* Nutrition Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {meal.protein || 0}
            </div>
            <div className="text-xs text-gray-500 uppercase">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {meal.carbs || 0}
            </div>
            <div className="text-xs text-gray-500 uppercase">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {meal.fat || 0}
            </div>
            <div className="text-xs text-gray-500 uppercase">Fat</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MealCarousel = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products/all-products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMeals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching meals:', err);
      // Sample data for demo
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // card width + gap
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" from-orange-50 to-yellow-50  px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {meals.map((meal, index) => (
              <MealCard key={meal.id || index} meal={meal} />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>


      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MealCarousel;