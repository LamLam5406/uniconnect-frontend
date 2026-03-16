import { useState } from 'react';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student', 
    full_name: '',
    company_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'student') {
        payload.full_name = formData.full_name;
      } else if (formData.role === 'company') {
        payload.company_name = formData.company_name;
        payload.description = formData.description;
      }

      const response = await adminApi.createUser(payload);
      toast.success(response.message || 'Tạo tài khoản thành công!');
      
      setFormData({
        email: '', password: '', role: 'student', full_name: '', company_name: '', description: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-2xl mx-auto bg-white p-8 md:p-10 mt-8 rounded-3xl shadow-sm border border-slate-200">
      
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tạo Tài Khoản Mới</h2>
        <div className="w-12 h-1 bg-[#007db3] mx-auto rounded-full mt-3"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- THÔNG TIN ĐĂNG NHẬP --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email đăng nhập (*)</label>
            <input
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              placeholder="VD: user@hus.edu.vn"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#007db3] focus:bg-white outline-none text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mật khẩu (*)</label>
            <input
              type="password" name="password" required minLength={6}
              value={formData.password} onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#007db3] focus:bg-white outline-none text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* --- PHÂN QUYỀN --- */}
        <div className="border-t border-b border-slate-100 py-6 my-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Loại tài khoản (Vai trò)</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleChange} className="w-4 h-4 text-[#007db3] focus:ring-[#007db3] border-slate-300 rounded" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-[#007db3] transition-colors">Sinh viên</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="role" value="company" checked={formData.role === 'company'} onChange={handleChange} className="w-4 h-4 text-[#007db3] focus:ring-[#007db3] border-slate-300 rounded" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-[#007db3] transition-colors">Doanh nghiệp</span>
            </label>
          </div>
        </div>

        {/* --- THÔNG TIN HỒ SƠ TƯƠNG ỨNG --- */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          
          {formData.role === 'student' && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Hồ sơ Sinh viên</h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Họ và tên</label>
                <input
                  type="text" name="full_name"
                  value={formData.full_name} onChange={handleChange}
                  placeholder="Để trống sẽ mặc định là 'Chưa cập nhật'"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#007db3] outline-none text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {formData.role === 'company' && (
            <div className="animate-fade-in space-y-5">
              <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Hồ sơ Doanh nghiệp</h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tên công ty</label>
                <input
                  type="text" name="company_name"
                  value={formData.company_name} onChange={handleChange}
                  placeholder="Để trống sẽ mặc định là 'Chưa cập nhật'"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#007db3] outline-none text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả ngắn</label>
                <textarea
                  name="description" rows={3}
                  value={formData.description} onChange={handleChange}
                  placeholder="Vài nét về doanh nghiệp..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#007db3] outline-none text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit" disabled={isLoading}
            className={`w-full sm:w-auto px-10 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#007db3] transition-all text-xs tracking-widest uppercase shadow-md hover:shadow-blue-200/50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'ĐANG TẠO...' : 'TẠO NGƯỜI DÙNG MỚI'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;