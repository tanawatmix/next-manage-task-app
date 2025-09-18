"use client";

import React from "react";
import Image from "next/image";
import tasklogo from "../../assets/images/Iconcreme-Halloween-Cat.ico";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  // State for form data
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State for loading indicator

  // Function to handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Revoke previous object URL to prevent memory leaks
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      let publicImageUrl = "";

      // 1. Upload image if it exists
      if (image) {
        // Create a more organized file path
        const imagePath = `public/${Date.now()}_${image.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task_bk") // Your bucket name
          .upload(imagePath, image);

        if (uploadError) {
          // Log the detailed error to the console for easier debugging
          console.error("Supabase Upload Error:", uploadError);
          alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + uploadError.message);
          setIsSubmitting(false); // Re-enable the button
          return;
        }

        // 2. Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from("task_bk")
          .getPublicUrl(imagePath);

        if (!urlData || !urlData.publicUrl) {
            throw new Error("Could not get public URL for the image.");
        }

        publicImageUrl = urlData.publicUrl;
      }

      // 3. Insert the new task into the database table
      const { data: insertData, error: insertError } = await supabase
        .from("task_tb") // Your table name
        .insert([
          {
            title: title,
            detail: detail,
            is_complete: status,
            image_url: publicImageUrl, // Use the public URL from storage
          },
        ])
        .select();

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        alert("เกิดข้อผิดพลาดในการเพิ่มงาน: " + insertError.message);
        return;
      }

      alert("เพิ่มงานสำเร็จ!");
      router.push("/alltask"); // Navigate back to the task list

    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด: " + (err?.message || String(err)));
    } finally {
        setIsSubmitting(false); // Re-enable button in all cases
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <Image src={tasklogo} alt="Task Logo" width={80} height={80} priority />
          <h1 className="text-3xl font-bold mt-5 mb-7 text-gray-800">
            Manage Task App
          </h1>
        </div>
        
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6 border-b pb-4">
          ➕ เพิ่มงานใหม่
        </h2>
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block mb-2 font-medium text-gray-700">
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
            <label htmlFor="detail" className="block mb-2 font-medium text-gray-700">
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
            <label className="block mb-2 font-medium text-gray-700">อัปโหลดรูป</label>
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
            <label htmlFor="status" className="block mb-2 font-medium text-gray-700">
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
              {isSubmitting ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มงาน'}
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