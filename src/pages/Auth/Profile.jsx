import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.role === 'student';

  const [profileData, setProfileData] = useState({
    full_name: '', phone: '', gender: '', university: '', major: '', gpa: '', skills: '', bio: '', cv_url: '',
    company_name: '', website: '', address: '', size: '', industry: '', description: '', logo_url: ''
  });
  
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [isStudent]);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getProfile();
      // FIX LỖI 1: Lấy đúng object StudentProfile/CompanyProfile từ Sequelize trả về
      if (isStudent) {
        const studentInfo = data.StudentProfile || {}; 
        setProfileData(prev => ({ ...prev, ...studentInfo }));
      } else {
        const companyInfo = data.CompanyProfile || {}; 
        setProfileData(prev => ({ ...prev, ...companyInfo }));
      }
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ!');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key !== 'cv_url' && key !== 'logo_url' && profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });
      
      // FIX LỖI 2: Đính kèm file. 
      // LƯU Ý: Chữ 'file' ở đây phải khớp với upload.single('file') ở Backend.
      if (file) {
        formData.append('file', file); 
      }

      await authApi.updateProfile(formData);
      toast.success('Cập nhật hồ sơ thành công!');
      
      await fetchProfile(); // Cập nhật lại dữ liệu mới nhất từ server
      setFile(null); // Reset file
      setIsEditing(false); 
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  // Các biến hiển thị
  const displayName = isStudent ? profileData.full_name : profileData.company_name;
  const displaySubtitle = isStudent ? profileData.major : profileData.industry;
  const initialChar = displayName ? displayName.charAt(0).toUpperCase() : (isStudent ? 'U' : 'C');

  return (
    <div className="max-w-[1200px] mx-auto font-sans">
      {!isEditing ? (
        /* --- VIEW MODE --- */
        <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
          {/* CỘT TRÁI (Thông tin cơ bản) */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
              {!isStudent && profileData.logo_url ? (
                <img 
                  src={profileData.logo_url} 
                  alt="Logo" 
                  className="w-24 h-24 mx-auto object-contain rounded-2xl shadow-md mb-4 bg-gray-50 p-2"
                />
              ) : (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#007db3] to-blue-600 rounded-2xl shadow-md flex items-center justify-center text-4xl font-black text-white uppercase mb-4">
                  {initialChar}
                </div>
              )}

              <h1 className="text-xl font-bold text-slate-800 mb-1">{displayName || (isStudent ? 'Chưa cập nhật tên' : 'Chưa cập nhật tên công ty')}</h1>
              <p className="text-slate-500 font-medium text-sm mb-6">{displaySubtitle || (isStudent ? 'Sinh viên' : 'Doanh nghiệp')}</p>
              
              {isStudent ? (
                profileData.cv_url ? (
                  <a href={profileData.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-blue-50 text-[#007db3] font-bold rounded-xl hover:bg-[#007db3] hover:text-white transition-colors border border-blue-100 hover:border-transparent text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Xem Hồ sơ CV
                  </a>
                ) : <div className="w-full py-2.5 bg-slate-50 text-slate-400 font-medium rounded-xl border border-slate-100 text-sm">Chưa có CV</div>
              ) : (
                profileData.website ? (
                   <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-blue-50 text-[#007db3] font-bold rounded-xl hover:bg-[#007db3] hover:text-white transition-colors border border-blue-100 hover:border-transparent text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    Truy cập Website
                  </a>
                ) : <div className="w-full py-2.5 bg-slate-50 text-slate-400 font-medium rounded-xl border border-slate-100 text-sm">Chưa có Website</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Thông tin liên hệ</h3>
              <ul className="space-y-4">
                {isStudent ? (
                  <>
                    <li className="flex justify-between items-center"><span className="text-slate-500 text-sm">Điện thoại:</span><span className="font-semibold text-slate-800 text-sm">{profileData.phone || '---'}</span></li>
                    <li className="flex justify-between items-center"><span className="text-slate-500 text-sm">Giới tính:</span><span className="font-semibold text-slate-800 text-sm">{profileData.gender || '---'}</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex justify-between items-center"><span className="text-slate-500 text-sm">Quy mô:</span><span className="font-semibold text-slate-800 text-sm">{profileData.size || '---'} nhân viên</span></li>
                    <li className="flex flex-col gap-1"><span className="text-slate-500 text-sm">Địa chỉ:</span><span className="font-semibold text-slate-800 text-sm">{profileData.address || '---'}</span></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI (Thông tin chi tiết) */}
          <div className="flex-1 space-y-6">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Chi tiết Hồ sơ</h2>
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-[#007db3] transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Chỉnh sửa
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{isStudent ? 'Giới thiệu bản thân' : 'Mô tả doanh nghiệp'}</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {(isStudent ? profileData.bio : profileData.description) || <span className="text-slate-400 italic">Chưa có thông tin giới thiệu.</span>}
              </p>
            </div>

            {isStudent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Học vấn</h3>
                  <ul className="space-y-4">
                    <li><span className="block text-slate-500 text-xs mb-1">Trường học</span><span className="font-bold text-slate-800 text-sm">{profileData.university || '---'}</span></li>
                    <li><span className="block text-slate-500 text-xs mb-1">Chuyên ngành</span><span className="font-bold text-slate-800 text-sm">{profileData.major || '---'}</span></li>
                    <li><span className="block text-slate-500 text-xs mb-1">Điểm GPA (Hệ 4.0)</span><span className="font-black text-[#007db3]">{profileData.gpa ? `${profileData.gpa} / 4.0` : '---'}</span></li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Kỹ năng chuyên môn</h3>
                  {profileData.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 bg-blue-50 text-[#007db3] rounded-md text-xs font-bold border border-blue-100">{skill.trim()}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 italic text-sm">Chưa cập nhật kỹ năng.</p>}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Lĩnh vực hoạt động</h3>
                {profileData.industry ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.industry.split(',').map((ind, index) => (
                      <span key={index} className="px-2.5 py-1 bg-blue-50 text-[#007db3] rounded-md text-xs font-bold border border-blue-100">{ind.trim()}</span>
                    ))}
                  </div>
                ) : <p className="text-slate-400 italic text-sm">Chưa cập nhật ngành nghề.</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- EDIT MODE --- */
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
          {/* CỘT TRÁI (Sửa Liên hệ & File đính kèm) */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Thông tin cơ bản</h3>
              <div className="space-y-4">
                {isStudent ? (
                  <>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Họ và Tên</label><input type="text" name="full_name" value={profileData.full_name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Số điện thoại</label><input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Giới tính</label>
                      <select name="gender" value={profileData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm">
                        <option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Tên Doanh Nghiệp</label><input type="text" name="company_name" value={profileData.company_name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Quy mô (Số nhân viên)</label><input type="text" name="size" value={profileData.size} onChange={handleInputChange} placeholder="VD: 50-100" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{isStudent ? 'Hồ sơ đính kèm' : 'Logo Doanh nghiệp'}</h3>
              <label className="block text-xs font-bold text-slate-500 mb-2">{isStudent ? 'Tải lên CV (PDF, DOC)' : 'Tải lên Logo (PNG, JPG)'}</label>
              <input type="file" name="file" onChange={handleFileChange} accept={isStudent ? ".pdf,.doc,.docx" : "image/*"} className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-blue-50 file:text-[#007db3] hover:file:bg-blue-100 cursor-pointer" />
            </div>
          </div>

          {/* CỘT PHẢI (Sửa Chi tiết & Nút Lưu) */}
          <div className="flex-1 space-y-6">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Cập nhật Hồ sơ</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setIsEditing(false); setFile(null); }} className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Hủy</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 rounded-lg font-bold text-white bg-[#007db3] hover:bg-blue-700 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-70">
                  {isLoading && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  Lưu thay đổi
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{isStudent ? 'Giới thiệu bản thân' : 'Mô tả chi tiết doanh nghiệp'}</label>
                <textarea name={isStudent ? "bio" : "description"} value={isStudent ? profileData.bio : profileData.description} onChange={handleInputChange} rows={isStudent ? "3" : "5"} placeholder={isStudent ? "Mục tiêu nghề nghiệp..." : "Giới thiệu về lĩnh vực, môi trường làm việc..."} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {isStudent ? (
                  <>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1.5">Trường Đại học</label><input type="text" name="university" value={profileData.university} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Điểm GPA</label><input type="number" step="0.01" max="4.0" name="gpa" value={profileData.gpa} onChange={handleInputChange} placeholder="VD: 3.2" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 mb-1.5">Chuyên ngành</label><input type="text" name="major" value={profileData.major} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 mb-1.5">Kỹ năng chuyên môn (Cách nhau bằng dấu phẩy)</label><input type="text" name="skills" value={profileData.skills} onChange={handleInputChange} placeholder="VD: ReactJS, NodeJS..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 mb-1.5">Ngành nghề</label><input type="text" name="industry" value={profileData.industry} onChange={handleInputChange} placeholder="VD: Công nghệ thông tin, Tài chính..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 mb-1.5">Website</label><input type="text" name="website" value={profileData.website} onChange={handleInputChange} placeholder="VD: www.congty.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                    <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-500 mb-1.5">Địa chỉ trụ sở</label><input type="text" name="address" value={profileData.address} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#007db3] outline-none text-sm" /></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;