import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { REGISTERABLE_ROLES, ROLE_LABELS, ROLES } from "@/shared/constants/roles";

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useRegister();
  const [role, setRole] = useState<number>(ROLES.STUDENT);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Vai trò</span>
        <select
          value={role}
          onChange={(event) => setRole(Number(event.target.value))}
          className="rounded border px-3 py-2"
          disabled={isLoading}
        >
          {REGISTERABLE_ROLES.map((registerableRole) => (
            <option key={registerableRole} value={registerableRole}>
              {ROLE_LABELS[registerableRole]}
            </option>
          ))}
        </select>
      </label>
      <GoogleLogin
        onSuccess={({ credential }) => {
          if (credential) void registerUser(credential, role);
        }}
        onError={() => undefined}
        useOneTap={false}
      />
      {isLoading && <p className="text-sm text-gray-600">Đang tạo tài khoản với Google...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
