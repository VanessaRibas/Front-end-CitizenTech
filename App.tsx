
import React, { useState } from "react";
import { StatusBar, Alert } from "react-native";

import { LoginScreen, UserRole } from "./src/screens/LoginScreen";
import { SelectRoleScreen } from "./src/screens/SelectRoleScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { DashboardUserScreen } from "./src/screens/DashboardUserScreen";
import { DashboardContactScreen } from "./src/screens/DashboardContactScreen";
import { DashboardAdminScreen } from "./src/screens/DashboardAdminScreen";

type AppRoute = "LOGIN" | "SELECT_ROLE" | "REGISTER" | "DASHBOARD";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("LOGIN");

  const [userRole, setUserRole] = useState<UserRole>("PCD");

  const [registerRole, setRegisterRole] = useState<UserRole>("PCD");

  const [userData, setUserData] = useState<any>(null);

  function handleLoginSuccess(role: UserRole, email: string) {
    setUserRole(role);

    setUserData({
      nome: email.split("@")[0],
      email,
    });

    setCurrentRoute("DASHBOARD");
  }

  function handleSelectRegisterRole(role: UserRole) {
    setRegisterRole(role);
    setCurrentRoute("REGISTER");
  }

  function handleCompleteRegister(role: UserRole, data: any) {
    setUserRole(role);
    setUserData(data);

    Alert.alert(
      "Sucesso!",
      "Cadastro concluído com sucesso."
    );

    setCurrentRoute("DASHBOARD");
  }

  function handleLogout() {
    setCurrentRoute("LOGIN");
    setUserData(null);
  }

  return (
    <>
      <StatusBar
        backgroundColor="#0B0B0E"
        barStyle="light-content"
      />

      {currentRoute === "LOGIN" && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() =>
            setCurrentRoute("SELECT_ROLE")
          }
        />
      )}

      {currentRoute === "SELECT_ROLE" && (
        <SelectRoleScreen
          onSelectRole={handleSelectRegisterRole}
          onBackToLogin={() =>
            setCurrentRoute("LOGIN")
          }
        />
      )}

      {currentRoute === "REGISTER" && (
        <RegisterScreen
          role={registerRole}
          onCompleteRegister={handleCompleteRegister}
          onBack={() =>
            setCurrentRoute("SELECT_ROLE")
          }
        />
      )}

      {currentRoute === "DASHBOARD" &&
        userRole === "PCD" && (
          <DashboardUserScreen
            userData={userData}
            onLogout={handleLogout}
          />
        )}

      {currentRoute === "DASHBOARD" &&
        userRole === "CONTATO" && (
          <DashboardContactScreen
            userData={userData}
            onLogout={handleLogout}
          />
        )}

      {currentRoute === "DASHBOARD" &&
        userRole === "ADMIN" && (
          <DashboardAdminScreen
            userData={userData}
            onLogout={handleLogout}
          />
        )}
    </>
  );
}