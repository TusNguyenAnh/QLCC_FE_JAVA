import React from "react";
import {Routes, Route} from "react-router-dom";

import MainLayout from "@/layouts/main-layout.tsx";
import Organization from "@/pages/organization/organization.tsx";
import Apartment from "@/pages/apartment/apartment.tsx";
import {Building} from "@/pages/building/building.tsx";
import {Resident} from "@/pages/resident/resident.tsx";
import {Login} from "@/pages/authentication/login.tsx";
import {ProtectedRoute} from "@/layouts/protected-route";
import BusinessProcess from "@/pages/business/business-process.tsx";
import Reply from "@/pages/replies/reply.tsx";
import LandingPage from "@/pages/home/landing-page.tsx";
import {RegisterService} from "@/pages/authentication/register-service.tsx";
import NotFound from "@/layouts/not-found.tsx";
import Revenue from "@/pages/finance/revenue/revenue.tsx";
import Expense from "@/pages/finance/expense/expense.tsx";
import CashReport from "@/pages/report/cash-report.tsx";
import PermissionManagement from "@/pages/authorization/permission/permission-management.tsx";
import {RoleManagement} from "@/pages/authorization/role/role-management.tsx";
import UserManagement from "@/pages/authorization/user/user-management.tsx";
import FinanceModel from "@/pages/finance/model/finance-model.tsx";
import {SendRequest} from "@/pages/send-request/send-request.tsx";
import Deposit from "@/pages/deposit/deposit.tsx";

const AppRouter: React.FC = () => (
    <Routes>
        <Route path="/" element={<LandingPage/>}/>

        <Route path="/page/register-service" element={<RegisterService/>}/>

        <Route
            path="/page/dashboard"
            element={
                <ProtectedRoute>
                    <MainLayout content={null}></MainLayout>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/org"
            element={
                <ProtectedRoute
                    permissions={["view:organization", "manage:organization"]}
                    requireAll={true}

                >
                    <MainLayout content={<Organization/>}/>
                </ProtectedRoute>
            }
        />

        <Route path="/page/authori/role" element={
            <ProtectedRoute
                permissions={["manage:role", "view:role", "assign:role"]}
                requireAll={true}
            >
                <MainLayout content={<RoleManagement/>}>
                </MainLayout>
            </ProtectedRoute>
        }/>

        <Route path="/page/authori/permission" element={
            <ProtectedRoute
                permissions={["view:permission", "assign:permission"]}
                requireAll={true}
            >
                <MainLayout content={<PermissionManagement/>}>
                </MainLayout>
            </ProtectedRoute>
        }/>

        <Route path="/page/authori/user" element={
            <ProtectedRoute
                permissions={["view:user", "manage:user"]}
                requireAll={true}
            >
                <MainLayout content={<UserManagement/>}>
                </MainLayout>
            </ProtectedRoute>
        }/>

        <Route
            path="/page/bd"
            element={
                <ProtectedRoute permissions={["view:building"]}>
                    <MainLayout content={<Building/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/finance/model"
            element={
                <ProtectedRoute permissions={["view:building"]}>
                    <MainLayout content={<FinanceModel/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/apres/apt"
            element={
                // <ProtectedRoute permissions={["view:apartment"]}>
                    <MainLayout content={<Apartment/>}/>
                // </ProtectedRoute>
            }
        />


        <Route
            path="/page/apres/res"
            element={
                <ProtectedRoute permissions={["view:resident"]}>
                    <MainLayout content={<Resident/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/bsn"
            element={
                <ProtectedRoute permissions={["view:workflow"]}>
                    <MainLayout content={<BusinessProcess/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/reply"
            element={
                <ProtectedRoute permissions={["review:task"]}>
                    <MainLayout content={<Reply/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/send_request"
            element={
                <ProtectedRoute permissions={["view:task"]}>
                    <MainLayout content={<SendRequest/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/finance/revenue"
            element={
                <ProtectedRoute permissions={[]}>
                    <MainLayout content={<Revenue/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/finance/expense"
            element={
                <ProtectedRoute permissions={[]}>
                    <MainLayout content={<Expense/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/finance/deposit"
            element={
                <ProtectedRoute permissions={[]}>
                    <MainLayout content={<Deposit/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/page/report/cash"
            element={
                <ProtectedRoute permissions={[]}>
                    <MainLayout content={<CashReport/>}/>
                </ProtectedRoute>
            }
        />


        <Route path="/login" element={<Login/>}/>

        {/* 404 - Phải đặt cuối cùng */}
        <Route path="*" element={<NotFound/>}/>
    </Routes>
);
export default AppRouter;
