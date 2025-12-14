import { NextResponse } from "next/server";

function generateSlots(
  startHour = 9,   // 9 AM
  endHour = 21,    // 9 PM
  interval = 30    // 30 mins
) {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const h = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const mm = min === 0 ? "00" : min;

      slots.push(`${h}:${mm} ${ampm}`);
    }
  }

  return slots;
}

export async function GET() {
  const today = new Date();

  const dates = [0, 1, 2].map((i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    return {
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toDateString(),
      date: d.toISOString().split("T")[0],
      slots: generateSlots(9, 21), // ⭐ 9 AM → 9 PM
    };
  });

  return NextResponse.json({
    success: true,
    dates,
    arrivalNote: "Professional will arrive within 30 mins of selected slot",
  });
}
