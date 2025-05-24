import { Button, Form, Input, Modal, message } from "antd";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

const CompanyProfileForm = ({
  visible,
  onCancel,
  initialValues,
  onSuccess,
}: any) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("company_profile").upsert(
        {
          id: 1,
          company_name: values.company_name,
          company_npwp: values.company_npwp,
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      message.success("Profil perusahaan berhasil diperbarui!");
      onSuccess();
    } catch (error) {
      message.error("Gagal menyimpan perubahan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Profil Perusahaan"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Simpan
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="company_name"
          label="Nama Perusahaan"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Contoh: PT ABC Sejahtera" />
        </Form.Item>
        <Form.Item
          name="company_npwp"
          label="NPWP Perusahaan"
          rules={[
            { required: true, message: "Wajib diisi" },
            { pattern: /^\d{15,20}$/, message: "Format NPWP tidak valid" },
          ]}
        >
          <Input placeholder="Contoh: 123456789012345" maxLength={20} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyProfileForm;
