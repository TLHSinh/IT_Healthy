import React, { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { adminApi } from "../../api/adminApi";
import UsersModal from "../../components/admin/UsersModal";
import { toast } from "react-toastify";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCustomers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("❌ Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // ❌ "Xóa mềm" người dùng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn vô hiệu hóa người dùng này không?")) return;
    try {
      const formData = new FormData();
      formData.append("IsActive", "false");

      const res = await adminApi.updateCustomer(id, formData);
      if (res) {
        toast.success("✅ Người dùng đã được vô hiệu hóa!");
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Không thể vô hiệu hóa người dùng");
    }
  };

  const handleSave = () => {
    fetchUsers();
  };

  const activeUsers = users.filter(u => u.isActive);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">👥 Quản lý người dùng</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          <AiOutlinePlus /> Thêm người dùng
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Họ tên</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">SĐT</th>
              <th className="border p-2">Vai trò</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u, i) => (
              <tr key={u.customerId} className="border-t">
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{u.fullName}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.phone}</td>
                <td className="border p-2 text-center">{u.roleUser}</td>
                <td className="border p-2 text-center">
                  {u.isActive ? (
                    <span className="text-green-600 font-semibold">Hoạt động</span>
                  ) : (
                    <span className="text-gray-400">Vô hiệu</span>
                  )}
                </td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded text-white"
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(u.customerId)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded text-white"
                  >
                    <AiOutlineDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <UsersModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UsersManagement;
