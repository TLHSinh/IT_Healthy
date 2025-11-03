import axios from "axios";

const BASE = "http://localhost:5000/api";

// 🔐 Lấy token admin
function getToken() {
  return (
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken")
  );
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
  createStaff: async (payload) => {
    try {
      const formatted = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        gender: payload.gender,
        dob: payload.dob,
        roleStaff: payload.roleStaff,
        isActive: payload.isActive ?? true,
        storeId: payload.storeId || payload.StoreId || 1,
        hireDate: payload.hireDate || new Date().toISOString(),
        PasswordHash: payload.password || payload.PasswordHash || "",
      };
      const res = await axios.post(`${BASE}/staffs`, formatted, { headers: headers() });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.messages?.join("\n") ||
        err.response?.data?.message ||
        "❌ Tạo nhân viên thất bại";
      alert(msg);
      return null;
    }
  },
  updateStaff: async (id, payload) => {
    try {
      const formatted = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        gender: payload.gender,
        dob: payload.dob,
        roleStaff: payload.roleStaff,
        isActive: payload.isActive ?? true,
        storeId: payload.storeId || payload.StoreId || 1,
        hireDate: payload.hireDate || new Date().toISOString(),
        PasswordHash: payload.password || payload.PasswordHash || "",
      };
      const res = await axios.put(`${BASE}/staffs/${id}`, formatted, { headers: headers() });
      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.messages?.join("\n") ||
        err.response?.data?.message ||
        "❌ Cập nhật nhân viên thất bại";
      alert(msg);
      return null;
    }
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
      const msg = err.response?.data?.messages?.join("\n") || err.response?.data?.message || "❌ Tạo cửa hàng thất bại";
      alert(msg);
      return null;
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
      const msg = err.response?.data?.messages?.join("\n") || err.response?.data?.message || "❌ Cập nhật cửa hàng thất bại";
      alert(msg);
      return null;
    }
  },
  deleteStore: async (id) => {
    try {
      const res = await axios.delete(`${BASE}/stores/${id}`, { headers: headers() });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Không thể xóa cửa hàng";
      alert(msg);
      return null;
    }
  },

  // ====================== 👤 NGƯỜI DÙNG ======================
getCustomers: () => axios.get(`${BASE}/customers`, { headers: headers() }),
getCustomerById: (id) => axios.get(`${BASE}/customers/${id}`, { headers: headers() }),

createCustomer: async (formData) => {
  try {
    const res = await axios.post(`${BASE}/customers`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getToken()}`
      },
    });
    return res.data;
  } catch (err) {
    const messages =
      err.response?.data?.messages ||
      [err.response?.data?.message] ||
      ["❌ Tạo người dùng thất bại"];
    alert(messages.join("\n"));
    return null;
  }
},

updateCustomer: async (id, formData) => {
  try {
    const res = await axios.put(`${BASE}/customers/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getToken()}`
      },
    });
    return res.data;
  } catch (err) {
    const messages =
      err.response?.data?.messages ||
      [err.response?.data?.message] ||
      ["❌ Cập nhật người dùng thất bại"];
    alert(messages.join("\n"));
    return null;
  }
},
deleteCustomer: async (id) => {
  try {
    const res = await axios.delete(`${BASE}/customers/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || "❌ Không thể xóa người dùng";
    alert(msg);
    return null;
  }
},

};
