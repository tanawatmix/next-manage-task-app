import React from "react";
import Image from "next/image";
import tasklogo from "../assets/images/Iconcreme-Halloween-Cat.ico";
import Link from "next/link";

export default function page() {
  return (
    <div className="pt-20 ">
      <div className="flex flex-col items-center gap-10">
        <Image src={tasklogo} alt="Task Logo" />
        <h1 className="text-2xl font-bold">Manage Task App</h1>
        <Link href="/alltask" className="w-sm px-4 py-2 text-center text-white bg-amber-500 p-2 rounded-md hover:bg-amber-700 hover:scale-105 transition-scales duration-200">
          เข้าใช้งานระบบ
        </Link>
      </div>
    </div>
  );
}
