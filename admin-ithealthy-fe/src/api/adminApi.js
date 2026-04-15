import axios from "axios";
import { getAdminToken } from "../utils/adminAuth";

const BASE = "http://localhost:5000/api";

// 🔐 Lấy token admin
function getToken() {
  return getAdminToken();
}



// 🧾 Cấu hình headers
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const adminApi = {
  // ====================== 🔑 AUTH ======================
  login: (data) => axios.post(`${BASE}/auth/login-admin`, data),

  // ====================== 👨‍💼 NHÂN VIÊN ======================
  getStaffs: () => axios.get(`${BASE}/staffs`, { headers: headers() }),
  getStaffById: (id) => axios.get(`${BASE}/staffs/${id}`, { headers: headers() }),
  
  createStaff: async (payload, isFormData = false) => {
  const config = { headers: {} };
  config.headers.Authorization = `Bearer ${getToken()}`;
  if (isFormData) config.headers["Content-Type"] = "multipart/form-data";
  const res = await axios.post(`${BASE}/staffs`, payload, config);
  return res.data;
},

updateStaff: async (id, payload, isFormData = false) => {
  const config = { headers: {} };
  config.headers.Authorization = `Bearer ${getToken()}`;
  if (isFormData) config.headers["Content-Type"] = "multipart/form-data";
  const res = await axios.put(`${BASE}/staffs/${id}`, payload, config);
  return res.data;
},
  deleteStaff: async (id) => {
    try {
      const res = await axios.delete(`${BASE}/staffs/${id}`, { headers: headers() });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Không thể xóa nhân viên";
      alert(msg);
      return null;
    }
  },

  // ====================== 🏬 CỬA HÀNG ======================
  getStores: () => axios.get(`${BASE}/stores`, { headers: headers() }),
  getStoreById: (id) => axios.get(`${BASE}/stores/${id}`, { headers: headers() }),
  
  
  createStore: async (payload) => {
  try {
    const formatted = {
      storeName: payload.storeName,
      phone: payload.phone,
      streetAddress: payload.streetAddress,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      country: payload.country || "Việt Nam",
      postcode: payload.postcode,
      latitude: payload.latitude,
      longitude: payload.longitude,
      googlePlaceId: payload.googlePlaceId || "",
      rating: payload.rating || 0,
      dateJoined: payload.dateJoined || new Date().toISOString(),
      isActive: payload.isActive ?? true,
    };

    const res = await axios.post(`${BASE}/stores`, formatted, { headers: headers() });
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.messages?.join("\n") ||
      err.response?.data?.message ||
      "❌ Tạo cửa hàng thất bại";
    // ❌ Bỏ alert — ✅ ném lỗi để toast bắt và hiển thị
    throw new Error(msg);
  }
},

updateStore: async (id, payload) => {
  try {
    const formatted = {
      storeName: payload.storeName,
      phone: payload.phone,
      streetAddress: payload.streetAddress,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      country: payload.country || "Việt Nam",
      postcode: payload.postcode,
      latitude: payload.latitude,
      longitude: payload.longitude,
      googlePlaceId: payload.googlePlaceId || "",
      rating: payload.rating || 0,
      dateJoined: payload.dateJoined || new Date().toISOString(),
      isActive: payload.isActive ?? true,
    };

    const res = await axios.put(`${BASE}/stores/${id}`, formatted, { headers: headers() });
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.messages?.join("\n") ||
      err.response?.data?.message ||
      "❌ Cập nhật cửa hàng thất bại";
    throw new Error(msg);
  }
},

deleteStore: async (id) => {
  try {
    const res = await axios.delete(`${BASE}/stores/${id}`, { headers: headers() });
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || "❌ Không thể xóa cửa hàng";
    throw new Error(msg);
  }
},


  // ====================== 👤 NGƯỜI DÙNG ======================
 getCustomers: () => axios.get(`${BASE}/customers`, { headers: headers() }),
  getCustomerById: (id) =>
    axios.get(`${BASE}/customers/${id}`, { headers: headers() }),

  createCustomer: async (form) => {
  try {
    const formData = new FormData();
    formData.append("FullName", form.fullName || "");
    formData.append("Phone", form.phone || "");
    formData.append("PasswordHash", form.passwordHash || "");
    if (form.email) formData.append("Email", form.email);
    formData.append("Gender", form.gender || "Male");
    if (form.dob) formData.append("DOB", form.dob);
    formData.append("RoleUser", form.roleUser || "Customer");
    formData.append("IsActive", form.isActive ? "true" : "false");
    if (form.avatarFile) formData.append("Avatar", form.avatarFile); // ✅ Đổi lại đúng tên field

    const res = await axios.post(`${BASE}/customers`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.data.customer;
  } catch (err) {
    const messages =
      err.response?.data?.messages ||
      [err.response?.data?.message] ||
      ["❌ Thêm người dùng thất bại"];
    throw new Error(messages.join("\n"));
  }
},

updateCustomer: async (id, form) => {
  try {
    const formData = new FormData();
    formData.append("FullName", form.fullName || "");
    formData.append("Phone", form.phone || "");
    formData.append("PasswordHash", form.passwordHash || form.oldPassword || "123456");
    formData.append("Email", form.email || "");
    formData.append("Gender", form.gender || "Male");
    if (form.dob) formData.append("DOB", form.dob);
    formData.append("RoleUser", form.roleUser || "Customer");
    formData.append("IsActive", form.isActive ? "true" : "false");
    if (form.avatarFile) formData.append("Avatar", form.avatarFile); // ✅ Đổi lại đúng tên field

    const res = await axios.put(`${BASE}/customers/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.data.data;
  } catch (err) {
    const messages =
      err.response?.data?.messages ||
      [err.response?.data?.message] ||
      ["❌ Cập nhật người dùng thất bại"];
    throw new Error(messages.join("\n"));
  }
},


  deleteCustomer: async (id) => {
    try {
      await axios.delete(`${BASE}/customers/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return true;
    } catch (err) {
      console.error("deleteCustomer error:", err.response?.data || err);
      const msg = err.response?.data?.message || "❌ Không thể xóa người dùng";
      throw new Error(msg);
    }
  },

  // ====================== 🛒 SẢN PHẨM ======================
 getAllProducts: () =>
    axios.get(`${BASE}/products/all-products`, { headers: headers() }),

  getProductCategories: () =>
    axios.get(`${BASE}/category/category_pro`, { headers: headers() }),

  // Lấy sản phẩm theo ID
  getProductById: (id) =>
    axios.get(`${BASE}/products/${id}`, { headers: headers() }),

  // Thêm sản phẩm
  createProduct: async (payload) => {
    try {
      const res = await axios.post(`${BASE}/products/add`, payload, {
        headers: {
          ...headers(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Tạo sản phẩm thất bại!";
      throw new Error(msg);
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, payload) => {
    try {
      const res = await axios.put(`${BASE}/products/update/${id}`, payload, {
        headers: {
          ...headers(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Cập nhật sản phẩm thất bại!";
      throw new Error(msg);
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const res = await axios.delete(`${BASE}/products/delete/${id}`, {
        headers: headers(),
      });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Không thể xóa sản phẩm!";
      throw new Error(msg);
    }
  },
  
};




