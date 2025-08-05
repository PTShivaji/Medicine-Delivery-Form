import React, { useEffect, useState } from "react";

const MAX_TIME_SECONDS = 300; // 5 minutes

const DeliveryTimer = ({ deliveryTime, status }) => {
  const [elapsed, setElapsed] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    if (status !== "Out for Delivery") return;

    const startTime = new Date(deliveryTime);

    const updateTimer = () => {
      const now = new Date();
      const diffSec = Math.floor((now - startTime) / 1000);

      if (diffSec >= MAX_TIME_SECONDS) {
        setIsExceeded(true);
      }

      const min = String(Math.floor(diffSec / 60)).padStart(2, "0");
      const sec = String(diffSec % 60).padStart(2, "0");

      setElapsed(`${min}:${sec}`);
      setProgress(Math.min((diffSec / MAX_TIME_SECONDS) * 100, 100));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deliveryTime, status]);

 return (
  <div className="min-h-[40px]">
    {status === "Delivered" ? (
      <span className="text-green-600 font-semibold">Delivered</span>
    ) : status === "Out for Delivery" ? (
      <div>
        {isExceeded ? (
          <span className="text-red-600 font-semibold">⏰ Time Exceeded</span>
        ) : (
          <span className="font-semibold">{elapsed}</span>
        )}
        <div className="w-full h-2 mt-1 bg-gray-300 rounded">
          <div
            className={`h-2 rounded transition-all duration-500 ${
              isExceeded ? "bg-red-600" : "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    ) : (
      <span className="text-gray-400 italic">—</span>
    )}
  </div>
);

};

export default DeliveryTimer;