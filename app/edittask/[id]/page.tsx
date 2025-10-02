"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import tasklogo from "../../../assets/images/Iconcreme-Halloween-Cat.ico";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    async function fetchTaskById() {
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .eq("id", taskId)
        .single();
      if (error) {
        alert("Error มีปัญหาในการดึงข้อมูลโปรดลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      }
      setTitle(data.title);
      setDetail(data.detail);
      setStatus(data.is_complete);
      setPreviewImage(data.image_url);
      setOldImage(data.image_url);
    }
    if (taskId) fetchTaskById();
  }, [taskId]);

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  let publicImageUrl = oldImage || "";

  // ถ้ามีการอัปโหลดรูปใหม่
  if (image) {
    // 🔥 ลบรูปเก่าออกจาก storage ถ้ามี
    if (oldImage) {
      const fileImageName = oldImage.split("/public/").pop(); 
      if (fileImageName) {
        await supabase.storage
          .from("task_bk")
          .remove([`public/${fileImageName}`]); // ไม่ต้องใส่ task_bk ซ้ำ
      }
    }

    // อัปโหลดรูปใหม่
    const imagePath = `public/${Date.now()}_${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("task_bk")
      .upload(imagePath, image);

    if (uploadError) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + uploadError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("task_bk")
      .getPublicUrl(imagePath);

    if (!urlData || !urlData.publicUrl) {
      alert("ไม่สามารถดึง public URL ของรูปภาพได้");
      setIsSubmitting(false);
      return;
    }

    publicImageUrl = urlData.publicUrl;
  }

  // อัปเดตข้อมูล task พร้อม url รูปใหม่
  const { error } = await supabase
    .from("task_tb")
    .update({
      title,
      detail,
      is_complete: status,
      image_url: publicImageUrl,
      update_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  setIsSubmitting(false);

  if (error) {
    alert("เกิดข้อผิดพลาดในการแก้ไขงาน: " + error.message);
    return;
  } else {
    alert("แก้ไขงานสำเร็จ!");
    router.push("/alltask");
  }
};

  return (
    <div className="p-4 sm:p-8 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <Image
            src={tasklogo}
            alt="Task Logo"
            width={80}
            height={80}
            priority
          />
          <h1 className="text-3xl font-bold mt-5 mb-7 text-gray-800">
            Manage Task App
          </h1>
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6 border-b pb-4">
          ✏️ แก้ไขงาน
        </h2>
        <form className="w-full space-y-6" onSubmit={handleUpdateTask}>
          <div>
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              ชื่องาน
            </label>
            <input
              type="text"
              id="title"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="ใส่ชื่องานที่นี่..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="detail"
              className="block mb-2 font-medium text-gray-700"
            >
              รายละเอียด
            </label>
            <textarea
              id="detail"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="ใส่รายละเอียดงาน..."
              rows={5}
              required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              อัปโหลดรูป
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              className="inline-block bg-gray-200 text-gray-700 px-5 py-3 rounded-lg cursor-pointer hover:bg-gray-300 font-semibold transition"
              htmlFor="fileInput"
            >
              เลือกรูปภาพ...
            </label>
            {previewImage && (
              <div className="mt-4">
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover border-2 border-gray-200"
                />
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="status"
              className="block mb-2 font-medium text-gray-700"
            >
              สถานะ
            </label>
            <select
              id="status"
              className="border border-gray-300 rounded-lg p-3 w-full bg-white focus:ring-2 focus:ring-blue-500 transition"
              value={status ? "1" : "0"}
              onChange={(e) => setStatus(e.target.value === "1")}
            >
              <option value="0">❌ ยังไม่เสร็จ</option>
              <option value="1">✅ เสร็จแล้ว</option>
            </select>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>

        <Link
          href="/alltask"
          className="text-blue-600 w-full text-center block mt-6 hover:underline font-medium"
        >
          กลับหน้าแสดงงานทั้งหมด
        </Link>
      </div>
    </div>
  );
}
