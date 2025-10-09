"use client"

/**
 * Demo Page for VMU Sidebar
 * Shows the professional sidebar in action
 */

import { Sidebar } from "../components/Sidebar"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* VMU Professional Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trường Đại học Hàng hải Việt Nam</h1>
            <p className="text-lg text-gray-600">Hệ thống quản lý sinh viên - VMU Portal</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảng Điều Khiển</h3>
              <p className="text-gray-600">Tổng quan về hoạt động học tập và thông tin quan trọng.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Khám Phá Kiến Thức</h3>
              <p className="text-gray-600">Các bài kiểm tra và đánh giá kiến thức chuyên môn.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nhật Ký Hành Trình</h3>
              <p className="text-gray-600">Lịch sử học tập và quá trình phát triển cá nhân.</p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Chào mừng đến với VMU Portal</h2>
            <p className="text-blue-100 text-lg">
              Hệ thống quản lý sinh viên hiện đại với giao diện chuyên nghiệp, được thiết kế đặc biệt cho Trường Đại học
              Hàng hải Việt Nam.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
