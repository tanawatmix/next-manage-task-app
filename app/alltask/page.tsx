"use client";

import React from "react";
import Image from "next/image";
import tasklogo from "../../assets/images/Iconcreme-Halloween-Cat.ico";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  image_url: string;
  is_complete: boolean;
  update_at: string;
};

export default function page() {
  //สร้าง state สำหรับเก็บข้อมูล task
  const [tasks, setTasks] = useState<Task[]>([]);

  //ดึงข้อมูล task จาก Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("task_tb")
        //หรือจะใช้ * เพื่อเอาทั้งหมดก็ได้
        .select(
          "id, created_at, title, detail, image_url, is_complete, update_at"
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.log("Error fetching tasks:", error);
      } else {
        setTasks(data as unknown as Task[]);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-20 ">
      <div className="flex flex-col items-center gap-10">
        <Image src={tasklogo} alt="Task Logo" width={100} height={100} />
        <h1 className="text-2xl font-bold">All Task</h1>
      </div>

      <div className="flex flex-row-reverse">
        <Link
          href="/addtask"
          className="px-4 py-2 text-center text-white bg-amber-500 p-2 rounded-md hover:bg-amber-700 hover:scale-105 transition-scales duration-200"
        >
          เพิ่มงาน
        </Link>
      </div>

      <div className="mt-20 mb-20">
        <table className="min-w-full border border-pink-400 text-sm">
          <thead className="bg-green-100">
            <tr>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Detail</th>
              <th className="border px-4 py-2">status</th>
              <th className="border px-4 py-2">Created At</th>
              <th className="border px-4 py-2">Update At</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* วนลูป state: task ซึ้งเป็นอาเรย์ */}
            {tasks.map((task) => (
              <tr key={task.id} className="text-center">
                <td className="border px-4 py-2">
                    {task.image_url ? (
                        <Image
                            src={task.image_url}
                            alt={task.title}
                            width={50}
                            height={50}
                            className="mx-auto"
                        />
                    ) : (
                        <span>No Image</span>
                    )}
                </td>
                <td className="border px-4 py-2">{task.title}</td>
                <td className="border px-4 py-2">{task.detail}</td>
                <td className="border px-4 py-2">
                  {task.is_complete ? "👍Completed" : "Pending🔃"}
                </td>
                <td className="border px-4 py-2">
                  {new Date(task.created_at).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(task.update_at).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/edittask/${task.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button className="text-red-500 hover:underline ml-4">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/"
        className="px-4 py-2 text-center mt-5 text-white block bg-amber-500 p-2 rounded-md hover:bg-amber-700 hover:scale-105 transition-scales duration-200"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
