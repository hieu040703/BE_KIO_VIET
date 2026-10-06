--
-- PostgreSQL database dump
--

\restrict fs6Z1meuhCv8g68GdHUzny3fqEHNw8dpj1SIBhh1lkxSFY3B7idNLxLKIMRkg3u

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS thienbao;
--
-- Name: thienbao; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE thienbao WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE thienbao OWNER TO postgres;

\unrestrict fs6Z1meuhCv8g68GdHUzny3fqEHNw8dpj1SIBhh1lkxSFY3B7idNLxLKIMRkg3u
\connect thienbao
\restrict fs6Z1meuhCv8g68GdHUzny3fqEHNw8dpj1SIBhh1lkxSFY3B7idNLxLKIMRkg3u

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: allocate_revenue_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.allocate_revenue_type_enum AS ENUM (
    'Quản lý nhân viên',
    'Kế toán',
    'Sale khảo sát báo giá',
    'Tuyển dụng',
    'Quản lý chi nhánh',
    'Quản lý kho',
    'Tài xế',
    'Cộng tác viên'
);


ALTER TYPE public.allocate_revenue_type_enum OWNER TO postgres;

--
-- Name: announcements_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.announcements_status_enum AS ENUM (
    'DRAFT',
    'SENT'
);


ALTER TYPE public.announcements_status_enum OWNER TO postgres;

--
-- Name: attributes_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.attributes_type_enum AS ENUM (
    'UNIT',
    'CATEGORY',
    'FINANCE',
    'ADVANCE_SALARY',
    'ADVANCE_EMPLOYEE',
    'POSITION',
    'REFERRAL_BONUS',
    'SPECIAL_REQUIREMENT',
    'VEHICLE_TYPE',
    'VEHICLE_TONNAGE',
    'SITE_TYPE',
    'CARGO_UNIT',
    'CONT_SPECIAL_REQUIREMENT',
    'TRUCK_TYPE',
    'CONTAINER_TYPE',
    'DOCUMENT_REQUIREMENT',
    'EMPLOYEE_EXPERTISE'
);


ALTER TYPE public.attributes_type_enum OWNER TO postgres;

--
-- Name: call_histories_calltype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.call_histories_calltype_enum AS ENUM (
    'ATA',
    'PTP'
);


ALTER TYPE public.call_histories_calltype_enum OWNER TO postgres;

--
-- Name: customer_cares_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.customer_cares_method_enum AS ENUM (
    'CALL',
    'EMAIL',
    'ZALO',
    'SMS',
    'IN_PERSON',
    'OTHER'
);


ALTER TYPE public.customer_cares_method_enum OWNER TO postgres;

--
-- Name: customer_cares_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.customer_cares_status_enum AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELED'
);


ALTER TYPE public.customer_cares_status_enum OWNER TO postgres;

--
-- Name: customers_source_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.customers_source_enum AS ENUM (
    'GOOGLE',
    'FACEBOOK',
    'YOUTUBE',
    'INSTAGRAM',
    'TIKTOK',
    'ZALO',
    'OTHER'
);


ALTER TYPE public.customers_source_enum OWNER TO postgres;

--
-- Name: customers_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.customers_type_enum AS ENUM (
    'INDIVIDUAL',
    'BUSINESS'
);


ALTER TYPE public.customers_type_enum OWNER TO postgres;

--
-- Name: debts_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.debts_type_enum AS ENUM (
    'RECEIVABLE',
    'PAYABLE'
);


ALTER TYPE public.debts_type_enum OWNER TO postgres;

--
-- Name: employee_ticket_replies_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_ticket_replies_type_enum AS ENUM (
    'ADMIN',
    'AUTHORIZED_USER',
    'EMPLOYEE',
    'SYSTEM'
);


ALTER TYPE public.employee_ticket_replies_type_enum OWNER TO postgres;

--
-- Name: employee_tickets_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_tickets_status_enum AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public.employee_tickets_status_enum OWNER TO postgres;

--
-- Name: employee_tickets_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_tickets_type_enum AS ENUM (
    'PAYROLL_BENEFITS',
    'ATTENDANCE_LEAVE',
    'CONTRACT_PROFILE',
    'WORK_ASSIGNMENT',
    'EQUIPMENT_IT',
    'OPERATION_INCIDENT',
    'FEEDBACK_REQUEST',
    'OTHER'
);


ALTER TYPE public.employee_tickets_type_enum OWNER TO postgres;

--
-- Name: employees_position_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employees_position_enum AS ENUM (
    'Quản lý nhân viên',
    'Kế toán',
    'Sale khảo sát báo giá',
    'Tuyển dụng',
    'Quản lý chi nhánh',
    'Quản lý kho',
    'Tài xế',
    'Cộng tác viên'
);


ALTER TYPE public.employees_position_enum OWNER TO postgres;

--
-- Name: employees_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employees_status_enum AS ENUM (
    'active',
    'inactive',
    'on_leave'
);


ALTER TYPE public.employees_status_enum OWNER TO postgres;

--
-- Name: finances_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.finances_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.finances_status_enum OWNER TO postgres;

--
-- Name: finances_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.finances_type_enum AS ENUM (
    'INCOME',
    'EXPENSE',
    'SALARY',
    'ADVANCE_SALARY',
    'ADVANCE_EMPLOYEE',
    'SETTLEMENT',
    'REIMBURSE',
    'MARGIN'
);


ALTER TYPE public.finances_type_enum OWNER TO postgres;

--
-- Name: invoices_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invoices_type_enum AS ENUM (
    'PURCHASE',
    'SALES'
);


ALTER TYPE public.invoices_type_enum OWNER TO postgres;

--
-- Name: margins_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.margins_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.margins_status_enum OWNER TO postgres;

--
-- Name: margins_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.margins_type_enum AS ENUM (
    'MARGIN',
    'UNIFORM'
);


ALTER TYPE public.margins_type_enum OWNER TO postgres;

--
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'SYSTEM',
    'USER',
    'ALERT',
    'INFO',
    'REMINDER',
    'CHAT',
    'MENTION',
    'CALL'
);


ALTER TYPE public.notifications_type_enum OWNER TO postgres;

--
-- Name: order_employees_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_employees_status_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED'
);


ALTER TYPE public.order_employees_status_enum OWNER TO postgres;

--
-- Name: order_leaders_position_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_leaders_position_enum AS ENUM (
    'Quản lý nhân viên',
    'Kế toán',
    'Sale khảo sát báo giá',
    'Tuyển dụng',
    'Quản lý chi nhánh',
    'Quản lý kho',
    'Tài xế',
    'Cộng tác viên'
);


ALTER TYPE public.order_leaders_position_enum OWNER TO postgres;

--
-- Name: orders_branchmanagerconfirmedstatus_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_branchmanagerconfirmedstatus_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED'
);


ALTER TYPE public.orders_branchmanagerconfirmedstatus_enum OWNER TO postgres;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'CANCELED'
);


ALTER TYPE public.orders_status_enum OWNER TO postgres;

--
-- Name: rag_documents_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rag_documents_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.rag_documents_status_enum OWNER TO postgres;

--
-- Name: reward_points_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reward_points_type_enum AS ENUM (
    'EARNED',
    'REDEEMED'
);


ALTER TYPE public.reward_points_type_enum OWNER TO postgres;

--
-- Name: service_order_chat_messages_messagetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_order_chat_messages_messagetype_enum AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE',
    'SYSTEM'
);


ALTER TYPE public.service_order_chat_messages_messagetype_enum OWNER TO postgres;

--
-- Name: service_orders_documentrequirement_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_orders_documentrequirement_enum AS ENUM (
    'HOP_DONG',
    'BB_NGHIEM_THU',
    'BOTH'
);


ALTER TYPE public.service_orders_documentrequirement_enum OWNER TO postgres;

--
-- Name: service_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_orders_status_enum AS ENUM (
    'WAITING_FOR_CUSTOMER_CONFIRMATION',
    'WAITING_FOR_QUOTE',
    'WAITING_FOR_EMPLOYEE_CONFIRMATION',
    'CONFIRMED',
    'PROCESSING',
    'COMPLETED_BY_EMPLOYEE',
    'COMPLETED_BY_CUSTOMER',
    'CANCELED'
);


ALTER TYPE public.service_orders_status_enum OWNER TO postgres;

--
-- Name: service_orders_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_orders_type_enum AS ENUM (
    'BOC_XEP_THEO_CA',
    'CHUYEN_NHA_VAN_PHONG',
    'PHA_DO_HOAN_TRA',
    'VAN_CHUYEN_VAT_TU',
    'NANG_HA_CONT',
    'DICH_VU_VAN_TAI',
    'XE_NANG_XE_CAU'
);


ALTER TYPE public.service_orders_type_enum OWNER TO postgres;

--
-- Name: services_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.services_type_enum AS ENUM (
    'BOC_XEP_THEO_CA',
    'CHUYEN_NHA_VAN_PHONG',
    'PHA_DO_HOAN_TRA',
    'VAN_CHUYEN_VAT_TU',
    'NANG_HA_CONT',
    'DICH_VU_VAN_TAI',
    'XE_NANG_XE_CAU'
);


ALTER TYPE public.services_type_enum OWNER TO postgres;

--
-- Name: support_room_chat_messages_messagetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.support_room_chat_messages_messagetype_enum AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE',
    'SYSTEM'
);


ALTER TYPE public.support_room_chat_messages_messagetype_enum OWNER TO postgres;

--
-- Name: ticket_replies_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_replies_type_enum AS ENUM (
    'ADMIN',
    'SUPPORT',
    'CUSTOMER',
    'SYSTEM'
);


ALTER TYPE public.ticket_replies_type_enum OWNER TO postgres;

--
-- Name: tickets_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tickets_status_enum AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public.tickets_status_enum OWNER TO postgres;

--
-- Name: tickets_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tickets_type_enum AS ENUM (
    'LATE_ARRIVAL',
    'STAFF_SHORTAGE',
    'ASSET_DAMAGE',
    'SERVICE_ATTITUDE',
    'OTHER'
);


ALTER TYPE public.tickets_type_enum OWNER TO postgres;

--
-- Name: time_keepings_otheramounttype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.time_keepings_otheramounttype_enum AS ENUM (
    'BONUS',
    'PENALTY',
    'MARGIN',
    'ADVANCE_SALARY',
    'UNIFORM',
    'REFERRER_ORDER',
    'CREATE_ORDER',
    'ALLOCATED_REVENUE_ORDER'
);


ALTER TYPE public.time_keepings_otheramounttype_enum OWNER TO postgres;

--
-- Name: time_keepings_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.time_keepings_type_enum AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public.time_keepings_type_enum OWNER TO postgres;

--
-- Name: transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transactions_type_enum AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public.transactions_type_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'MANAGER',
    'SUPPORT',
    'EMPLOYEE',
    'USER'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: vouchers_templates_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vouchers_templates_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.vouchers_templates_status_enum OWNER TO postgres;

--
-- Name: zalo_message_histories_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.zalo_message_histories_status_enum AS ENUM (
    'SENDING',
    'SENT',
    'FAILED',
    'REJECTED',
    'THROTTLED'
);


ALTER TYPE public.zalo_message_histories_status_enum OWNER TO postgres;

--
-- Name: zalo_message_histories_templatetype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.zalo_message_histories_templatetype_enum AS ENUM (
    'CREATE',
    'COMPLETE',
    'VOTE',
    'COMPLETE_AND_VOTE'
);


ALTER TYPE public.zalo_message_histories_templatetype_enum OWNER TO postgres;

--
-- Name: zalo_templates_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.zalo_templates_type_enum AS ENUM (
    'CREATE',
    'COMPLETE',
    'VOTE',
    'COMPLETE_AND_VOTE'
);


ALTER TYPE public.zalo_templates_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: allocate_revenue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.allocate_revenue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    "fromDate" date,
    "toDate" date,
    type public.allocate_revenue_type_enum NOT NULL,
    "totalRevenue" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalAllocatedRevenue" numeric(15,2),
    "totalUnallocatedRevenue" numeric(15,2),
    "totalRevenueToAllocate" numeric(15,2)
);


ALTER TABLE public.allocate_revenue OWNER TO postgres;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    "sentAt" timestamp without time zone,
    "sentBy" uuid,
    status public.announcements_status_enum DEFAULT 'DRAFT'::public.announcements_status_enum NOT NULL
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "order" json NOT NULL,
    customer json NOT NULL,
    employee json NOT NULL,
    voucher json NOT NULL,
    notification json NOT NULL
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attributes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    code character varying,
    type public.attributes_type_enum NOT NULL,
    value character varying,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.attributes OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    code character varying,
    address jsonb DEFAULT '{}'::jsonb NOT NULL,
    "employeeId" uuid,
    hotline character varying(20),
    "isInternal" boolean DEFAULT false NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: call_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.call_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "startTime" timestamp with time zone NOT NULL,
    "endTime" timestamp with time zone,
    duration integer,
    "answerDuration" integer,
    "endCallCause" character varying,
    "endedBy" character varying,
    "callType" public.call_histories_calltype_enum DEFAULT 'PTP'::public.call_histories_calltype_enum NOT NULL,
    "callerPhoneNumber" character varying,
    "receiverPhoneNumber" character varying,
    "callerId" uuid,
    "receiverId" uuid,
    "orderId" uuid,
    "callId" character varying NOT NULL,
    "recordingUrl" character varying
);


ALTER TABLE public.call_histories OWNER TO postgres;

--
-- Name: call_navigations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.call_navigations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "customerId" uuid,
    "employeePhone" character varying,
    phone character varying NOT NULL,
    "stringeePhone" character varying NOT NULL,
    "userId" uuid NOT NULL,
    "orderId" uuid NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    "callId" character varying,
    "expiresAt" timestamp with time zone
);


ALTER TABLE public.call_navigations OWNER TO postgres;

--
-- Name: customer_cares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_cares (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "customerId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    method public.customer_cares_method_enum NOT NULL,
    status public.customer_cares_status_enum DEFAULT 'SCHEDULED'::public.customer_cares_status_enum NOT NULL,
    "scheduledAt" timestamp with time zone NOT NULL,
    "completedAt" timestamp with time zone,
    "nextFollowUpAt" timestamp with time zone
);


ALTER TABLE public.customer_cares OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "branchId" uuid,
    code character varying NOT NULL,
    type public.customers_type_enum DEFAULT 'INDIVIDUAL'::public.customers_type_enum NOT NULL,
    name character varying NOT NULL,
    "zaloName" character varying,
    "customName" character varying,
    phone character varying NOT NULL,
    source public.customers_source_enum,
    address jsonb,
    email character varying,
    dob date,
    gender character varying,
    "taxCode" character varying,
    "businessCode" character varying,
    "openingDebt" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    avatar character varying,
    "referralCode" character varying,
    "referralStaff" uuid
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: debts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    code character varying NOT NULL,
    "customerId" uuid NOT NULL,
    type public.debts_type_enum NOT NULL,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "orderId" uuid NOT NULL,
    "financeId" uuid
);


ALTER TABLE public.debts OWNER TO postgres;

--
-- Name: employee_ticket_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_ticket_participants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "employeeTicketId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "addedByUserId" uuid NOT NULL,
    "removedByUserId" uuid
);


ALTER TABLE public.employee_ticket_participants OWNER TO postgres;

--
-- Name: employee_ticket_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_ticket_replies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "employeeTicketId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    content text NOT NULL,
    type public.employee_ticket_replies_type_enum NOT NULL,
    attachments jsonb
);


ALTER TABLE public.employee_ticket_replies OWNER TO postgres;

--
-- Name: employee_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_tickets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "employeeId" uuid NOT NULL,
    "createdByUserId" uuid NOT NULL,
    type public.employee_tickets_type_enum NOT NULL,
    priority integer DEFAULT 3 NOT NULL,
    issue character varying(255) NOT NULL,
    description text NOT NULL,
    attachments jsonb,
    status public.employee_tickets_status_enum DEFAULT 'OPEN'::public.employee_tickets_status_enum NOT NULL
);


ALTER TABLE public.employee_tickets OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "branchId" uuid,
    code character varying(20) NOT NULL,
    dob date,
    gender character varying(10),
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50),
    "zaloName" character varying,
    "managerId" uuid,
    "recruiterId" uuid,
    "recruiterReceivedFullBonus" boolean DEFAULT false NOT NULL,
    "startDate" date,
    "endDate" date,
    address jsonb DEFAULT '{}'::jsonb NOT NULL,
    "identityNumber" character varying,
    status public.employees_status_enum DEFAULT 'active'::public.employees_status_enum NOT NULL,
    "isOfficial" boolean DEFAULT false NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "position" public.employees_position_enum,
    expertise text[] DEFAULT ARRAY[]::text[] NOT NULL,
    department character varying(100),
    "isWorking" boolean DEFAULT false NOT NULL,
    avatar jsonb
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: expense_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_approvals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "timeAt" timestamp with time zone NOT NULL,
    "requestedBy" uuid NOT NULL,
    "approvedBy" uuid,
    "approvedAt" timestamp with time zone,
    "isConfirm" boolean DEFAULT false NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.expense_approvals OWNER TO postgres;

--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_uploads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "objectName" character varying(500) NOT NULL,
    "originalName" character varying(255) NOT NULL,
    "bucketName" character varying(100) NOT NULL,
    "mimeType" character varying(50),
    size bigint NOT NULL,
    folder character varying(255),
    etag character varying(100),
    "downloadUrl" character varying(1000),
    "thumbnailObjectName" character varying(500),
    "thumbnailUrl" character varying(1000),
    "thumbnailSize" bigint,
    "uploadedBy" uuid,
    metadata jsonb,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.file_uploads OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "fileName" character varying(255) NOT NULL,
    "originalName" character varying(255) NOT NULL,
    path character varying(1024) NOT NULL,
    url character varying(1024) NOT NULL,
    size bigint NOT NULL,
    type character varying NOT NULL,
    "entityType" character varying(255),
    "entityId" uuid,
    "thumbnailPath" character varying(1024),
    "thumbnailUrl" character varying(1024),
    category character varying NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "isMain" boolean DEFAULT false NOT NULL,
    alt character varying(255),
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: finances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.finances (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "branchId" uuid,
    code character varying NOT NULL,
    type public.finances_type_enum NOT NULL,
    "userId" uuid,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "employeeId" uuid,
    "customerId" uuid,
    "orderId" uuid,
    "invoiceNumber" character varying,
    "isDeductedAdvanceSalary" boolean DEFAULT false NOT NULL,
    "isDeposit" boolean DEFAULT false NOT NULL,
    "isDebtRelated" boolean DEFAULT true NOT NULL,
    status public.finances_status_enum,
    "expenseApprovalId" uuid,
    "timeKeepingConfirmId" uuid
);


ALTER TABLE public.finances OWNER TO postgres;

--
-- Name: fund_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fund_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    code character varying NOT NULL,
    "fundId" uuid NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    "transactionAccountNumber" character varying,
    "transactionCode" character varying,
    "referenceCode" character varying,
    "transferType" character varying,
    description character varying
);


ALTER TABLE public.fund_transactions OWNER TO postgres;

--
-- Name: funds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    "bankName" character varying NOT NULL,
    bin character varying,
    "accountNumber" character varying NOT NULL,
    "accountHolder" character varying NOT NULL,
    branch character varying,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.funds OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid,
    "branchId" uuid,
    "customerId" uuid,
    "employeeId" uuid,
    "timeAt" timestamp with time zone NOT NULL,
    code character varying NOT NULL,
    type public.invoices_type_enum DEFAULT 'SALES'::public.invoices_type_enum NOT NULL,
    description character varying NOT NULL,
    "totalBeforeTax" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "taxPercent" double precision NOT NULL,
    "taxAmount" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalAfterTax" numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: margins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.margins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "branchId" uuid,
    "employeeId" uuid,
    code character varying NOT NULL,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "userId" uuid NOT NULL,
    type public.margins_type_enum DEFAULT 'MARGIN'::public.margins_type_enum NOT NULL,
    status public.margins_status_enum,
    "expenseApprovalId" uuid
);


ALTER TABLE public.margins OWNER TO postgres;

--
-- Name: notification_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "notificationId" uuid NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.notification_details OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    "timeAt" timestamp without time zone DEFAULT now() NOT NULL,
    type public.notifications_type_enum NOT NULL,
    "objectId" uuid,
    metadata jsonb
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_comment_read_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_comment_read_states (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lastReadCommentId" uuid
);


ALTER TABLE public.order_comment_read_states OWNER TO postgres;

--
-- Name: order_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "userId" uuid,
    "replyCommentId" uuid,
    content text,
    attachments jsonb,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    tags uuid[]
);


ALTER TABLE public.order_comments OWNER TO postgres;

--
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    unit character varying(100) NOT NULL,
    quantity double precision NOT NULL,
    "totalHours" double precision,
    price numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.order_details OWNER TO postgres;

--
-- Name: order_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "timeAt" timestamp with time zone,
    "checkInAt" timestamp with time zone,
    "checkInLatitude" double precision,
    "checkInLongitude" double precision,
    "checkOutAt" timestamp with time zone,
    "startTime" time without time zone,
    "breakTime" double precision DEFAULT '0'::double precision,
    "endTime" time without time zone,
    "totalHours" double precision,
    salary numeric(15,2),
    "isConfirmed" boolean DEFAULT false NOT NULL,
    status public.order_employees_status_enum DEFAULT 'PENDING'::public.order_employees_status_enum NOT NULL,
    "isLeader" boolean DEFAULT false NOT NULL,
    "leaderPercentAmount" numeric(15,2),
    "hasNotifiedCheckIn" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_employees OWNER TO postgres;

--
-- Name: order_leader_chat_read_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_leader_chat_read_states (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lastReadMessageId" uuid
);


ALTER TABLE public.order_leader_chat_read_states OWNER TO postgres;

--
-- Name: order_leader_chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_leader_chats (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "replyMessageId" uuid,
    content text,
    attachments jsonb,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    tags uuid[]
);


ALTER TABLE public.order_leader_chats OWNER TO postgres;

--
-- Name: order_leaders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_leaders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "position" public.order_leaders_position_enum DEFAULT 'Quản lý chi nhánh'::public.order_leaders_position_enum NOT NULL,
    "orderId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "revenueShare" numeric(15,2),
    "isRevenueShareAllocated" boolean DEFAULT false NOT NULL,
    "allocateRevenueId" uuid
);


ALTER TABLE public.order_leaders OWNER TO postgres;

--
-- Name: order_manager_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_manager_locations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy double precision,
    "speedMetersPerSecond" double precision,
    heading double precision,
    "distanceFromPreviousMeters" double precision,
    "capturedAt" timestamp with time zone DEFAULT now() NOT NULL,
    source character varying(50) DEFAULT 'manager-mobile'::character varying NOT NULL
);


ALTER TABLE public.order_manager_locations OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "serviceOrderId" uuid,
    "branchId" uuid NOT NULL,
    name character varying(255),
    code character varying(50) NOT NULL,
    "customerId" uuid NOT NULL,
    "customerEmail" character varying(255),
    "customerPhone" character varying(50),
    "customerTaxCode" character varying(20),
    "timeAt" timestamp with time zone NOT NULL,
    "estimatedCompletionAt" timestamp with time zone,
    address jsonb DEFAULT '{}'::jsonb NOT NULL,
    "deliveryAddress" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "preVatAmount" numeric(15,2),
    "discountPercent" double precision,
    "discountAmount" numeric(15,2),
    vat double precision,
    "vatAmount" numeric(15,2),
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "branchManagerId" uuid,
    "branchManagerConfirmedStatus" public.orders_branchmanagerconfirmedstatus_enum DEFAULT 'PENDING'::public.orders_branchmanagerconfirmedstatus_enum NOT NULL,
    "branchManagerConfirmedAt" timestamp with time zone,
    "allocateRevenuePercent" double precision,
    "hasAllocatedRevenue" boolean DEFAULT false NOT NULL,
    "referrerId" uuid,
    "referrerPercent" double precision,
    "isReferrerPaid" boolean DEFAULT false NOT NULL,
    "referrerAmount" numeric(15,2),
    "createdByEmployeeId" uuid,
    "createdByEmployeePercent" double precision,
    "isPaidForEmployeeCreateOrder" boolean DEFAULT false NOT NULL,
    "employeeCount" integer DEFAULT 1 NOT NULL,
    description text,
    status public.orders_status_enum DEFAULT 'PENDING'::public.orders_status_enum NOT NULL,
    link character varying(255),
    "isInvoiced" boolean DEFAULT false NOT NULL,
    "invoiceNumber" character varying(100),
    "invoiceDate" timestamp with time zone,
    deposit double precision,
    "isPaid" boolean DEFAULT false NOT NULL,
    "isUrgent" boolean DEFAULT false NOT NULL,
    "completedByEmployeeId" uuid,
    "completedAt" timestamp with time zone,
    "calculationVersion" integer DEFAULT 0 NOT NULL,
    "calculatedVersion" integer DEFAULT 0 NOT NULL,
    rating integer
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: permission_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name text NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.permission_groups OWNER TO postgres;

--
-- Name: rag_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rag_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "fileName" character varying(500) NOT NULL,
    "originalName" character varying(500) NOT NULL,
    "mimeType" character varying(100) NOT NULL,
    size bigint NOT NULL,
    "filePath" text NOT NULL,
    "fileUrl" text,
    status public.rag_documents_status_enum DEFAULT 'PENDING'::public.rag_documents_status_enum NOT NULL,
    "chunkCount" integer DEFAULT 0 NOT NULL,
    "totalChars" integer DEFAULT 0 NOT NULL,
    provider character varying(50) DEFAULT 'gemini'::character varying NOT NULL,
    "embeddingModel" character varying(100),
    category character varying(255),
    "extraMetadata" jsonb
);


ALTER TABLE public.rag_documents OWNER TO postgres;

--
-- Name: reward_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reward_points (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "customerId" uuid NOT NULL,
    "orderId" uuid,
    type public.reward_points_type_enum NOT NULL,
    points integer NOT NULL
);


ALTER TABLE public.reward_points OWNER TO postgres;

--
-- Name: service_order_chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_order_chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "serviceOrderId" uuid NOT NULL,
    "senderUserId" uuid,
    "messageType" public.service_order_chat_messages_messagetype_enum NOT NULL,
    content text,
    attachments jsonb,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb,
    tags uuid[]
);


ALTER TABLE public.service_order_chat_messages OWNER TO postgres;

--
-- Name: service_order_chat_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_order_chat_participants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "serviceOrderId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "addedByUserId" uuid
);


ALTER TABLE public.service_order_chat_participants OWNER TO postgres;

--
-- Name: service_order_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_order_ratings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    rating integer NOT NULL,
    review text
);


ALTER TABLE public.service_order_ratings OWNER TO postgres;

--
-- Name: service_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "customerId" uuid NOT NULL,
    "branchId" uuid,
    "branchManagerId" uuid,
    "employeeId" uuid,
    "syncedToVector" boolean DEFAULT false NOT NULL,
    code character varying(50),
    type public.service_orders_type_enum NOT NULL,
    "timeAt" timestamp without time zone NOT NULL,
    "orderStartNotificationSentAt" timestamp with time zone,
    address jsonb NOT NULL,
    "isDebt" boolean DEFAULT false NOT NULL,
    "needsQuote" boolean DEFAULT false NOT NULL,
    "documentRequirement" public.service_orders_documentrequirement_enum,
    "contactName" character varying(255),
    "contactPhone" character varying(50),
    description text,
    status public.service_orders_status_enum DEFAULT 'WAITING_FOR_QUOTE'::public.service_orders_status_enum NOT NULL,
    rating integer,
    "basePrice" numeric(15,2),
    "isUrgent" boolean DEFAULT false NOT NULL,
    "hasFragileItems" boolean DEFAULT false NOT NULL,
    "vouchersId" uuid,
    quote json,
    "preVatAmount" numeric(15,2),
    "hasVat" boolean DEFAULT false NOT NULL,
    vat numeric(15,2),
    "vatAmount" numeric(15,2),
    amount numeric(15,2),
    "specialRequirements" text,
    "employeeSpecialization" character varying(255),
    "employeeCount" integer,
    "floorLocationPickup" integer,
    "hasElevatorPickup" boolean,
    "floorLocationDelivery" integer,
    "hasElevatorDelivery" boolean,
    "needsWrapping" boolean,
    "needsDismantle" boolean,
    "movingVehicleType" character varying,
    "vehicleTonnage" character varying,
    "tripCount" integer,
    "needsCleaning" boolean,
    "itemsDetail" jsonb,
    "pickupAddress" jsonb,
    "distanceToPickup" double precision,
    "deliveryAddress" jsonb,
    "distanceToDelivery" double precision,
    "siteType" character varying(255),
    "siteArea" double precision,
    "materialsDetail" jsonb,
    "containerCount" integer,
    "cargoUnitCount" integer,
    "containerUnit" character varying,
    "containerWeight" numeric(15,2),
    "containerLocationType" character varying,
    "distanceToStorage" double precision,
    "contSpecialRequirements" text,
    "needsForklift" boolean,
    "forkliftCount" integer,
    "needsCrane" boolean,
    "craneCount" integer,
    "carType" character varying(255),
    "servicePrices" jsonb
);


ALTER TABLE public.service_orders OWNER TO postgres;

--
-- Name: service_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_prices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "serviceId" uuid NOT NULL,
    category character varying NOT NULL,
    unit character varying NOT NULL,
    price numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    quantity numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "excessUnitPrice" numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.service_prices OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    type public.services_type_enum NOT NULL,
    "autoQuote" boolean DEFAULT false NOT NULL,
    icon character varying,
    description character varying
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: support_room_chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_room_chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "supportRoomId" uuid NOT NULL,
    "senderUserId" uuid,
    "messageType" public.support_room_chat_messages_messagetype_enum NOT NULL,
    content text,
    attachments jsonb,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb
);


ALTER TABLE public.support_room_chat_messages OWNER TO postgres;

--
-- Name: support_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    "customerId" uuid NOT NULL,
    "hasUnreadMessages" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.support_rooms OWNER TO postgres;

--
-- Name: ticket_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_replies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "ticketId" uuid NOT NULL,
    content text NOT NULL,
    type public.ticket_replies_type_enum NOT NULL,
    attachments jsonb,
    "isInternal" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.ticket_replies OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "customerId" uuid NOT NULL,
    "serviceOrderId" uuid,
    type public.tickets_type_enum NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    issue character varying(255) NOT NULL,
    description text NOT NULL,
    "contactPhone" character varying(20) NOT NULL,
    "preferredTime" character varying(255),
    status public.tickets_status_enum NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: time_keeping_confirms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_keeping_confirms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "employeeId" uuid NOT NULL,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    "startAt" timestamp with time zone NOT NULL,
    "endAt" timestamp with time zone NOT NULL,
    "userId" uuid NOT NULL,
    "totalHours" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalDayWorked" numeric(15,2),
    "totalSalary" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalRealSalary" numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    "totalAdvance" numeric(15,2),
    "totalMargin" numeric(15,2),
    "totalUniform" numeric(15,2),
    "totalPenalty" numeric(15,2),
    "totalBonus" numeric(15,2),
    "isPaid" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.time_keeping_confirms OWNER TO postgres;

--
-- Name: time_keepings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_keepings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "employeeId" uuid NOT NULL,
    "timeKeepingConfirmId" uuid,
    "orderEmployeeId" uuid,
    "timeAt" timestamp with time zone,
    "startTime" time without time zone,
    "endTime" time without time zone,
    "totalHours" double precision,
    salary numeric(15,2),
    "advanceSalaryId" uuid,
    "marginId" uuid,
    "referrerOrderId" uuid,
    "otherAmount" numeric(15,2),
    "otherAmountType" public.time_keepings_otheramounttype_enum,
    "isPaid" boolean DEFAULT false NOT NULL,
    "isCollected" boolean DEFAULT false NOT NULL,
    "incomeId" uuid,
    type public.time_keepings_type_enum,
    "referralEmployeeId" uuid,
    "referralConfigCode" character varying,
    "referralAppliedDate" timestamp with time zone,
    "isRevenueShareAllocation" boolean DEFAULT false NOT NULL,
    "revenueShareStartDate" date,
    "revenueShareEndDate" date,
    "allocateRevenueId" uuid
);


ALTER TABLE public.time_keepings OWNER TO postgres;

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "refreshToken" character varying,
    "sessionType" character varying(10),
    "firebaseToken" character varying,
    "expiresAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tokens OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    code character varying NOT NULL,
    "financeId" uuid NOT NULL,
    type public.transactions_type_enum NOT NULL,
    "timeAt" timestamp with time zone DEFAULT now() NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "permissionGroupId" uuid,
    "employeeId" uuid,
    "customerId" uuid,
    code character varying(255) NOT NULL,
    username character varying(255),
    password character varying(255) NOT NULL,
    role public.users_role_enum DEFAULT 'EMPLOYEE'::public.users_role_enum NOT NULL,
    phone character varying(20),
    name character varying(255),
    email character varying(255),
    avatar character varying(255),
    address jsonb DEFAULT '{}'::jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    setting jsonb DEFAULT '{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}'::jsonb NOT NULL,
    "otpCode" character varying(10),
    "otpExpiresAt" timestamp with time zone,
    "referralCode" character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "customerId" uuid NOT NULL,
    "vouchersTemplateId" uuid NOT NULL,
    code character varying(80) NOT NULL,
    "redeemedAt" timestamp without time zone NOT NULL,
    "expiredAt" timestamp without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "usedAt" timestamp without time zone
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- Name: vouchers_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    points integer NOT NULL,
    amount numeric(15,2),
    status public.vouchers_templates_status_enum DEFAULT 'ACTIVE'::public.vouchers_templates_status_enum NOT NULL
);


ALTER TABLE public.vouchers_templates OWNER TO postgres;

--
-- Name: zalo_message_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zalo_message_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    "orderId" uuid NOT NULL,
    "customerId" uuid NOT NULL,
    "templateId" integer,
    "templateName" character varying,
    "templateType" public.zalo_message_histories_templatetype_enum,
    phone character varying NOT NULL,
    "msgId" character varying,
    status public.zalo_message_histories_status_enum DEFAULT 'SENDING'::public.zalo_message_histories_status_enum NOT NULL,
    "errorCode" integer,
    "errorMessage" character varying(500),
    "templateData" jsonb,
    "requestPayload" jsonb,
    "sentAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.zalo_message_histories OWNER TO postgres;

--
-- Name: zalo_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zalo_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tempId" uuid,
    note text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "createdBy" integer,
    "updatedBy" integer,
    "deletedAt" timestamp without time zone,
    name character varying NOT NULL,
    type public.zalo_templates_type_enum DEFAULT 'CREATE'::public.zalo_templates_type_enum NOT NULL,
    "templateId" character varying NOT NULL
);


ALTER TABLE public.zalo_templates OWNER TO postgres;

--
-- Data for Name: allocate_revenue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.allocate_revenue (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "timeAt", "fromDate", "toDate", type, "totalRevenue", "totalAllocatedRevenue", "totalUnallocatedRevenue", "totalRevenueToAllocate") FROM stdin;
00000000-0000-4000-8000-000000000027	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	2026-09-21 16:00:00+07	2026-09-01	2026-09-30	Quản lý chi nhánh	5500000.00	0.00	5500000.00	5500000.00
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", title, content, "sentAt", "sentBy", status) FROM stdin;
00000000-0000-4000-8000-000000000052	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Thông báo hệ thống Seed Full	Nội dung thông báo mẫu để test API announcement.	2026-09-21 16:00:00	00000000-0000-4000-8000-000000000007	SENT
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "order", customer, employee, voucher, notification) FROM stdin;
00000000-0000-4000-8000-000000000053	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	{"vat":10,"commission":5,"checkInDistanceThreshold":100,"orderStartNotificationMinutes":30,"urgentOrderAlertIntervalMinutes":15,"regularOrderAlertIntervalMinutes":60,"branchManagerRevenueShare":5,"accountantRevenueShare":2,"urgentOrderEnabled":true,"urgentOrderHours":2,"urgentOrderSurchargePercent":20,"fragileItemSurchargePercent":10}	{"referralBonus":100000,"referralThreshold":1000000}	{"salesTargetBonus":[],"turnoverPenalty":{"daysOff":7,"percentOff":5,"percentFine":2},"uniform":100000,"margin":200000}	{"minOrderValue":1000000,"pointToMoneyRate":1000}	{"preferences":["ORDER","FINANCE","TIMEKEEPING"]}
\.


--
-- Data for Name: attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attributes (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, code, type, value, "isDefault") FROM stdin;
52e2a614-c51a-49cb-9da3-699bb9e09804	\N	\N	2026-09-21 13:30:39.195625	2026-09-21 13:30:39.195625	\N	\N	\N	Thu tiền khách hàng	\N	FINANCE	\N	f
1d06cc7b-1a5d-4f03-bcbc-c36cdfb3ff3a	\N	\N	2026-09-21 13:31:17.735468	2026-09-21 13:31:17.735468	\N	\N	\N	Tạm ứng lương	\N	ADVANCE_SALARY	\N	f
5b955a18-817e-4a37-bac1-f5d0b7eb9730	\N	\N	2026-09-21 14:02:23.024636	2026-09-21 14:02:23.024636	\N	\N	\N	chuyên bốc vác	\N	EMPLOYEE_EXPERTISE	\N	f
6ecde032-5db7-405d-85b4-48f6640b1b10	\N	\N	2026-09-21 14:02:40.274721	2026-09-21 14:02:40.274721	\N	\N	\N	Quản lý nhân viên	\N	POSITION	\N	f
00000000-0000-4000-8000-000000000009	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Đơn vị demo	SEED-FULL-UNIT	UNIT	ca	t
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, code, address, "employeeId", hotline, "isInternal", "isDefault") FROM stdin;
87eacdd2-32ed-4f40-95d1-29706ce16ca9	\N	\N	2026-09-21 11:29:49.549974	2026-09-21 11:29:49.549974	\N	\N	\N	Cơ sở 1	CN-0001	{"ward": "Phường Cầu Giấy", "state": "Thành phố Hà Nội", "detail": "P506, Tòa Nhà 714, Nguyễn Văn Cừ"}	392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	f	f
79016246-b3da-46d1-b2fa-a3d8938609bb	\N	\N	2026-09-21 11:29:49.549974	2026-09-21 11:29:49.549974	\N	\N	\N	Cơ sở 2	CN-0002	{"ward": "Phường Hai Bà Trưng", "state": "Thành phố Hà Nội", "detail": "P0614 Time City"}	392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	f	f
be4a1232-9dee-416d-861d-708b807ad86c	\N	\N	2026-09-21 11:29:49.549974	2026-09-21 11:29:49.549974	\N	\N	\N	Cơ sở 3	CN-0003	{"ward": "Phường Hà Đông", "state": "Thành phố Hà Nội", "detail": "P0126 R5"}	392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	f	f
20cfe956-8de5-4b63-940d-cda3253857c9	\N	\N	2026-09-21 11:29:49.549974	2026-09-21 11:29:49.549974	\N	\N	\N	Cơ sở 4	CN-0004	{"ward": "Phường Bắc Từ Liêm", "state": "Thành phố Hà Nội", "detail": "347 Cổ Nhuế"}	392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	f	f
00000000-0000-4000-8000-000000000002	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Chi nhánh Seed Full	SEED-FULL-BRANCH-001	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	00000000-0000-4000-8000-000000000003	0900000001	t	f
\.


--
-- Data for Name: call_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.call_histories (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "startTime", "endTime", duration, "answerDuration", "endCallCause", "endedBy", "callType", "callerPhoneNumber", "receiverPhoneNumber", "callerId", "receiverId", "orderId", "callId", "recordingUrl") FROM stdin;
00000000-0000-4000-8000-000000000049	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	2026-09-21 16:00:00+07	2026-09-21 16:05:00+07	300	280	normal	caller	PTP	0900000005	0900000004	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000008	00000000-0000-4000-8000-000000000013	SEED-FULL-CALL-001	\N
\.


--
-- Data for Name: call_navigations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.call_navigations (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "customerId", "employeePhone", phone, "stringeePhone", "userId", "orderId", priority, "callId", "expiresAt") FROM stdin;
00000000-0000-4000-8000-000000000050	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000005	0900000002	0900000004	1900000001	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000013	1	SEED-FULL-NAV-001	2027-09-21 16:00:00+07
\.


--
-- Data for Name: customer_cares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_cares (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "customerId", "employeeId", method, status, "scheduledAt", "completedAt", "nextFollowUpAt") FROM stdin;
00000000-0000-4000-8000-000000000051	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000003	CALL	SCHEDULED	2026-09-22 00:00:00+07	\N	2026-09-28 16:00:00+07
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "branchId", code, type, name, "zaloName", "customName", phone, source, address, email, dob, gender, "taxCode", "businessCode", "openingDebt", avatar, "referralCode", "referralStaff") FROM stdin;
24d79892-3f11-4144-b534-ce4d24684979	\N	\N	2026-09-21 11:29:49.569122	2026-09-21 11:29:49.569122	\N	\N	\N	\N	KH-0001	INDIVIDUAL	Công ty TNHH ABC	\N	\N	0987654321	\N	\N	contact@abc.com	\N	\N	\N	\N	0.00	\N	\N	\N
7babfa0e-b4b6-45cc-9289-94b2ba636077	\N	\N	2026-09-21 11:29:49.569122	2026-09-21 11:29:49.569122	\N	\N	\N	\N	KH-0002	INDIVIDUAL	Công ty Cổ phần XYZ	\N	\N	0912345678	\N	\N	contact@xyz.com	\N	\N	\N	\N	0.00	\N	\N	\N
021588df-2848-492e-9331-103de223f649	\N	\N	2026-09-21 11:29:49.569122	2026-09-21 11:29:49.569122	\N	\N	\N	\N	KH-0003	INDIVIDUAL	Anh Hoàn	\N	\N	0912348888	\N	\N	hoan@gmail.com	\N	\N	\N	\N	0.00	\N	\N	\N
76c9c048-38df-43ba-9ce6-a08e63135321	\N	\N	2026-09-21 11:29:49.569122	2026-09-21 11:29:49.569122	\N	\N	\N	\N	KH-0004	INDIVIDUAL	Chị Nhung	\N	\N	0912345333	\N	\N	nhung@xyz.com	\N	\N	\N	\N	0.00	\N	\N	\N
c7f14287-103d-4b44-a212-c7fd81f58997	\N	\N	2026-09-21 13:25:30.30887	2026-09-21 13:25:30.30887	\N	\N	\N	\N	KH0005	INDIVIDUAL	khách hàng test	0964631365	\N	0964631365	ZALO	{"ward": "Xã Thanh Oai", "state": "Thành phố Hà Nội"}	nguyentienhieu632@gmail.com	2003-07-04	\N	00120103049344	\N	1000000.00	\N	\N	\N
00000000-0000-4000-8000-000000000005	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	SEED-FULL-CUS-001	BUSINESS	Công ty Demo Seed Full	\N	\N	0900000004	OTHER	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	seed.customer@example.com	\N	\N	0100000001	\N	0.00	\N	\N	\N
\.


--
-- Data for Name: debts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debts (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", code, "customerId", type, "timeAt", amount, "orderId", "financeId") FROM stdin;
00000000-0000-4000-8000-000000000023	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	SEED-FULL-DEBT-001	00000000-0000-4000-8000-000000000005	RECEIVABLE	2026-09-21 16:00:00+07	4500000.00	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000020
\.


--
-- Data for Name: employee_ticket_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_ticket_participants (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "employeeTicketId", "userId", "addedByUserId", "removedByUserId") FROM stdin;
00000000-0000-4000-8000-000000000040	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000038	00000000-0000-4000-8000-000000000008	00000000-0000-4000-8000-000000000007	\N
\.


--
-- Data for Name: employee_ticket_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_ticket_replies (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "employeeTicketId", "userId", content, type, attachments) FROM stdin;
00000000-0000-4000-8000-000000000039	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000038	00000000-0000-4000-8000-000000000007	Đã tiếp nhận ticket nội bộ.	AUTHORIZED_USER	\N
\.


--
-- Data for Name: employee_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_tickets (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "employeeId", "createdByUserId", type, priority, issue, description, attachments, status) FROM stdin;
00000000-0000-4000-8000-000000000038	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000003	00000000-0000-4000-8000-000000000008	WORK_ASSIGNMENT	2	Xác nhận phân công công việc	Ticket nội bộ mẫu để test luồng nhân viên.	\N	OPEN
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "branchId", code, dob, gender, name, email, phone, "zaloName", "managerId", "recruiterId", "recruiterReceivedFullBonus", "startDate", "endDate", address, "identityNumber", status, "isOfficial", "isDefault", "position", expertise, department, "isWorking", avatar) FROM stdin;
392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	\N	2026-09-21 11:29:49.05732	2026-09-21 11:29:49.05732	\N	\N	\N	\N	NV-0001	\N	\N	Admin Employee	\N	\N	\N	\N	\N	f	\N	\N	{}	\N	active	f	f	\N	{}	\N	f	\N
6e9aa4b0-a040-4b3e-bae9-cdb73f5b2788	\N	\N	2026-09-21 11:29:49.560635	2026-09-21 11:29:49.560635	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	NV-0002	\N	\N	Nguyễn Văn Nam	nguyenvana@example.com	\N	\N	\N	\N	f	\N	\N	{}	\N	active	f	f	Sale khảo sát báo giá	{}	Kinh doanh	f	\N
72a47a21-6d37-4abc-8a90-5fee7e198894	\N	\N	2026-09-21 11:29:49.560635	2026-09-21 11:29:49.560635	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	NV-0003	\N	\N	Trần Thị Bình	tranthib@example.com	\N	\N	\N	\N	f	\N	\N	{}	\N	active	f	f	Quản lý kho	{}	Kho	f	\N
d7e64225-c6f5-469e-ab00-c8a72b457348	\N	\N	2026-09-21 11:29:49.560635	2026-09-21 11:29:49.560635	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	NV-0004	\N	\N	Lê Văn Công	levanc@example.com	\N	\N	\N	\N	f	\N	\N	{}	\N	active	f	f	Kế toán	{}	Kế toán	f	\N
e93de671-1bbd-4a52-981d-9af686dec159	\N	\N	2026-09-21 11:29:49.560635	2026-09-21 11:29:49.560635	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	NV-0005	\N	\N	Phạm Thị Dung	phamthid@example.com	\N	\N	\N	\N	f	\N	\N	{}	\N	active	f	f	Tài xế	{}	Vận chuyển	f	\N
30593075-b2ad-4f93-bd62-34800c91c4eb	c11af44d-cc88-4ae1-9b96-a6a91b95c3bc	\N	2026-09-21 14:02:40.274721	2026-09-21 14:02:40.274721	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	NV0006	2003-07-04	Nam	nhân viên test	nguyentienhieu632@gmail.com	0964631367	nguyễn tiến hiếu	392f9ec5-9575-43a2-9379-706d4ef16fb0	6e9aa4b0-a040-4b3e-bae9-cdb73f5b2788	f	2025-09-03	\N	{"ward": "Xã Thanh Oai", "state": "Thành phố Hà Nội"}	001203019344	active	f	f	Quản lý nhân viên	{"chuyên bốc vác"}	quản lý	f	\N
00000000-0000-4000-8000-000000000003	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	SEED-FULL-EMP-001	\N	\N	Nhân viên Seed Full	seed.employee@example.com	0900000002	\N	\N	\N	f	\N	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	\N	active	t	f	Sale khảo sát báo giá	{"Bốc xếp","Điều phối"}	Vận hành	t	\N
00000000-0000-4000-8000-000000000004	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	SEED-FULL-EMP-002	\N	\N	Kế toán Seed Full	seed.accountant@example.com	0900000003	\N	\N	\N	f	\N	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	\N	active	t	f	Kế toán	{"Kế toán"}	Kế toán	t	\N
\.


--
-- Data for Name: expense_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_approvals (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "timeAt", "requestedBy", "approvedBy", "approvedAt", "isConfirm", amount) FROM stdin;
00000000-0000-4000-8000-000000000025	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	2026-09-21 16:00:00+07	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000007	2026-09-21 16:00:00+07	t	600000.00
\.


--
-- Data for Name: file_uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_uploads (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "objectName", "originalName", "bucketName", "mimeType", size, folder, etag, "downloadUrl", "thumbnailObjectName", "thumbnailUrl", "thumbnailSize", "uploadedBy", metadata, "isActive") FROM stdin;
00000000-0000-4000-8000-000000000042	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	seed/full/seed-full-demo.txt	seed-full-demo.txt	demo	text/plain	128	seed/full	seed-full-etag	https://example.com/seed-full-demo.txt	\N	\N	\N	00000000-0000-4000-8000-000000000007	{"source": "db:seed:full"}	t
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "fileName", "originalName", path, url, size, type, "entityType", "entityId", "thumbnailPath", "thumbnailUrl", category, "isPublic", "isMain", alt, status, "expiresAt") FROM stdin;
00000000-0000-4000-8000-000000000041	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	seed-full-demo.txt	seed-full-demo.txt	seed/full/seed-full-demo.txt	https://example.com/seed-full-demo.txt	128	DOCUMENT	order	00000000-0000-4000-8000-000000000013	\N	\N	document	t	f	Tệp demo Seed Full	active	\N
\.


--
-- Data for Name: finances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finances (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "branchId", code, type, "userId", "timeAt", category, amount, "employeeId", "customerId", "orderId", "invoiceNumber", "isDeductedAdvanceSalary", "isDeposit", "isDebtRelated", status, "expenseApprovalId", "timeKeepingConfirmId") FROM stdin;
ab43c9d3-5466-4798-a7e5-db380c00c5ce	406b97df-45d0-435c-987b-327c9d88fb5f	Thu tiền khách hàng khách hàng test	2026-09-21 13:30:39.195625	2026-09-21 13:30:39.195625	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	PT000001	INCOME	08096023-4ebe-4bf7-8021-892db9890205	2026-09-21 13:30:30.96+07	Thu tiền khách hàng	1000000.00	\N	c7f14287-103d-4b44-a212-c7fd81f58997	\N	\N	f	f	t	PENDING	\N	\N
de0c0fda-496c-43c1-a83d-3197c470967d	befb97e5-4142-456b-9a4a-6a9e59fe01e9	\N	2026-09-21 13:31:17.724964	2026-09-21 13:31:17.724964	\N	\N	\N	87eacdd2-32ed-4f40-95d1-29706ce16ca9	TUL0001	ADVANCE_SALARY	08096023-4ebe-4bf7-8021-892db9890205	2026-09-21 13:31:08.347+07	Tạm ứng lương	100000.00	6e9aa4b0-a040-4b3e-bae9-cdb73f5b2788	\N	\N	\N	f	f	t	PENDING	\N	\N
00000000-0000-4000-8000-000000000020	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	SEED-FULL-INCOME-001	INCOME	00000000-0000-4000-8000-000000000007	2026-09-21 16:00:00+07	Thu tiền đơn hàng Seed Full	1000000.00	\N	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000013	\N	f	t	t	APPROVED	\N	\N
00000000-0000-4000-8000-000000000021	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	SEED-FULL-ADVANCE-001	ADVANCE_SALARY	00000000-0000-4000-8000-000000000007	2026-09-21 16:00:00+07	Tạm ứng lương Seed Full	600000.00	00000000-0000-4000-8000-000000000003	\N	\N	\N	f	f	f	PENDING	\N	\N
\.


--
-- Data for Name: fund_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fund_transactions (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", code, "fundId", amount, "timeAt", "transactionAccountNumber", "transactionCode", "referenceCode", "transferType", description) FROM stdin;
00000000-0000-4000-8000-000000000031	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	SEED-FULL-FUND-TRANS-001	00000000-0000-4000-8000-000000000030	1000000.00	2026-09-21 16:00:00+07	\N	BANK-SEED-001	\N	\N	Nạp quỹ demo Seed Full
\.


--
-- Data for Name: funds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.funds (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, "bankName", bin, "accountNumber", "accountHolder", branch, "isDefault") FROM stdin;
53e62411-96e8-4e69-8129-33cb26e813c4	\N	\N	2026-09-21 11:29:49.579579	2026-09-21 11:29:49.579579	\N	\N	\N	MBank	Ngân hàng Quân Đội	970422	0888382699	PHAM VAN NAM	\N	t
00000000-0000-4000-8000-000000000030	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Quỹ Seed Full	MB Bank	970422	0000000001	CONG TY DEMO SEED FULL	Ha Noi	f
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "branchId", "customerId", "employeeId", "timeAt", code, type, description, "totalBeforeTax", "taxPercent", "taxAmount", "totalAfterTax") FROM stdin;
00000000-0000-4000-8000-000000000024	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000002	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000003	2026-09-21 16:00:00+07	SEED-FULL-INVOICE-001	SALES	Hóa đơn dịch vụ bốc xếp Seed Full	5000000.00	10	500000.00	5500000.00
\.


--
-- Data for Name: margins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.margins (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "branchId", "employeeId", code, "timeAt", amount, "userId", type, status, "expenseApprovalId") FROM stdin;
00000000-0000-4000-8000-000000000026	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000002	00000000-0000-4000-8000-000000000003	SEED-FULL-MARGIN-001	2026-09-21 16:00:00+07	200000.00	00000000-0000-4000-8000-000000000007	MARGIN	APPROVED	00000000-0000-4000-8000-000000000025
\.


--
-- Data for Name: notification_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_details (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "userId", "notificationId", "isRead") FROM stdin;
00000000-0000-4000-8000-000000000033	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000032	f
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", title, content, "timeAt", type, "objectId", metadata) FROM stdin;
00000000-0000-4000-8000-000000000032	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Thông báo Seed Full	Đây là thông báo mẫu để test API notification.	2026-09-21 16:00:00	INFO	00000000-0000-4000-8000-000000000013	{"source": "db:seed:full"}
\.


--
-- Data for Name: order_comment_read_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_comment_read_states (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "userId", "lastReadCommentId") FROM stdin;
00000000-0000-4000-8000-000000000055	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000016
\.


--
-- Data for Name: order_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_comments (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "userId", "replyCommentId", content, attachments, "timeAt", tags) FROM stdin;
00000000-0000-4000-8000-000000000016	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000007	\N	Bản ghi chú demo Seed Full	\N	2026-09-21 16:00:00+07	\N
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", name, unit, quantity, "totalHours", price, amount) FROM stdin;
00000000-0000-4000-8000-000000000014	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	Nhân công bốc xếp	ca	1	4	5000000.00	5000000.00
\.


--
-- Data for Name: order_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_employees (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "employeeId", "timeAt", "checkInAt", "checkInLatitude", "checkInLongitude", "checkOutAt", "startTime", "breakTime", "endTime", "totalHours", salary, "isConfirmed", status, "isLeader", "leaderPercentAmount", "hasNotifiedCheckIn") FROM stdin;
00000000-0000-4000-8000-000000000015	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000003	2026-09-21 16:00:00+07	\N	\N	\N	\N	09:00:00	0	13:00:00	4	800000.00	t	CONFIRMED	t	\N	f
\.


--
-- Data for Name: order_leader_chat_read_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_leader_chat_read_states (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "userId", "lastReadMessageId") FROM stdin;
00000000-0000-4000-8000-000000000056	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000019
\.


--
-- Data for Name: order_leader_chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_leader_chats (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "userId", "replyMessageId", content, attachments, "timeAt", tags) FROM stdin;
00000000-0000-4000-8000-000000000019	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000007	\N	Trao đổi mẫu giữa quản lý và nhân viên	\N	2026-09-21 16:00:00+07	\N
\.


--
-- Data for Name: order_leaders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_leaders (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "position", "orderId", "employeeId", "revenueShare", "isRevenueShareAllocated", "allocateRevenueId") FROM stdin;
00000000-0000-4000-8000-000000000017	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Quản lý chi nhánh	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000003	10.00	f	\N
\.


--
-- Data for Name: order_manager_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_manager_locations (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "employeeId", latitude, longitude, accuracy, "speedMetersPerSecond", heading, "distanceFromPreviousMeters", "capturedAt", source) FROM stdin;
00000000-0000-4000-8000-000000000018	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000003	21.027096	105.823715	5	\N	\N	\N	2026-09-21 16:00:00+07	seed-full
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "serviceOrderId", "branchId", name, code, "customerId", "customerEmail", "customerPhone", "customerTaxCode", "timeAt", "estimatedCompletionAt", address, "deliveryAddress", "preVatAmount", "discountPercent", "discountAmount", vat, "vatAmount", amount, "branchManagerId", "branchManagerConfirmedStatus", "branchManagerConfirmedAt", "allocateRevenuePercent", "hasAllocatedRevenue", "referrerId", "referrerPercent", "isReferrerPaid", "referrerAmount", "createdByEmployeeId", "createdByEmployeePercent", "isPaidForEmployeeCreateOrder", "employeeCount", description, status, link, "isInvoiced", "invoiceNumber", "invoiceDate", deposit, "isPaid", "isUrgent", "completedByEmployeeId", "completedAt", "calculationVersion", "calculatedVersion", rating) FROM stdin;
00000000-0000-4000-8000-000000000013	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000012	00000000-0000-4000-8000-000000000002	Đơn bốc xếp Seed Full	SEED-FULL-ORDER-001	00000000-0000-4000-8000-000000000005	seed.customer@example.com	0900000004	\N	2026-09-21 16:00:00+07	2026-09-22 00:00:00+07	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho nhận demo Seed Full", "country": "Viet Nam"}	5000000.00	\N	0.00	10	500000.00	5500000.00	00000000-0000-4000-8000-000000000003	CONFIRMED	2026-09-21 16:00:00+07	\N	f	\N	\N	f	\N	\N	\N	f	2	Đơn hàng mẫu để test toàn bộ API	PROCESSING	\N	t	SEED-FULL-INVOICE-001	2026-09-21 16:00:00+07	1000000	f	f	\N	\N	1	1	\N
\.


--
-- Data for Name: permission_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission_groups (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, permissions) FROM stdin;
5ee55b39-185f-4560-97a4-78aeddef40da	\N	\N	2026-09-21 11:29:49.525667	2026-09-21 11:29:49.525667	\N	\N	\N	Kế toán	{}
5fa0ef4a-eba3-4e04-9604-d30c74181c13	\N	\N	2026-09-21 11:29:49.525667	2026-09-21 11:50:36.986301	\N	\N	\N	Quản lý	{"debt": [], "fund": [], "user": [], "order": [], "branch": ["read", "create", "update", "delete"], "margin": [], "finance": [], "invoice": [], "service": [], "customer": [], "employee": [], "vouchers": [], "dashboard": [], "appSetting": [], "permission": [], "callHistory": [], "timekeeping": [], "serviceOrder": [], "zaloTemplate": [], "advanceSalary": [], "employeeTicket": [], "serviceSetting": [], "advanceEmployee": [], "allocateRevenue": [], "customerService": [], "vouchersTemplate": [], "zaloMessageHistory": [], "financeIncomeConfirm": [], "financeExpenseConfirm": []}
00000000-0000-4000-8000-000000000001	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Seed Full Manager	{"order": ["read", "create", "update", "confirm"], "branch": ["read", "create", "update"], "finance": ["read", "create"], "invoice": ["read", "create"], "customer": ["read", "create", "update"], "employee": ["read", "create", "update"], "timekeeping": ["read", "create", "update"]}
\.


--
-- Data for Name: rag_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rag_documents (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "fileName", "originalName", "mimeType", size, "filePath", "fileUrl", status, "chunkCount", "totalChars", provider, "embeddingModel", category, "extraMetadata") FROM stdin;
00000000-0000-4000-8000-000000000043	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	seed-full-guide.txt	seed-full-guide.txt	text/plain	256	seed/full/seed-full-guide.txt	https://example.com/seed-full-guide.txt	COMPLETED	1	256	seed	none	demo	{"source": "db:seed:full"}
\.


--
-- Data for Name: reward_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reward_points (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "customerId", "orderId", type, points) FROM stdin;
00000000-0000-4000-8000-000000000044	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000013	EARNED	100
\.


--
-- Data for Name: service_order_chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_order_chat_messages (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "serviceOrderId", "senderUserId", "messageType", content, attachments, "timeAt", metadata, tags) FROM stdin;
00000000-0000-4000-8000-000000000057	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000012	00000000-0000-4000-8000-000000000007	TEXT	Tin nhắn tư vấn demo Seed Full	\N	2026-09-21 16:00:00+07	\N	\N
\.


--
-- Data for Name: service_order_chat_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_order_chat_participants (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "serviceOrderId", "userId", "addedByUserId") FROM stdin;
00000000-0000-4000-8000-000000000058	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000012	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000007
\.


--
-- Data for Name: service_order_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_order_ratings (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "employeeId", rating, review) FROM stdin;
00000000-0000-4000-8000-000000000059	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000003	5	Phục vụ tốt - dữ liệu demo
\.


--
-- Data for Name: service_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_orders (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "customerId", "branchId", "branchManagerId", "employeeId", "syncedToVector", code, type, "timeAt", "orderStartNotificationSentAt", address, "isDebt", "needsQuote", "documentRequirement", "contactName", "contactPhone", description, status, rating, "basePrice", "isUrgent", "hasFragileItems", "vouchersId", quote, "preVatAmount", "hasVat", vat, "vatAmount", amount, "specialRequirements", "employeeSpecialization", "employeeCount", "floorLocationPickup", "hasElevatorPickup", "floorLocationDelivery", "hasElevatorDelivery", "needsWrapping", "needsDismantle", "movingVehicleType", "vehicleTonnage", "tripCount", "needsCleaning", "itemsDetail", "pickupAddress", "distanceToPickup", "deliveryAddress", "distanceToDelivery", "siteType", "siteArea", "materialsDetail", "containerCount", "cargoUnitCount", "containerUnit", "containerWeight", "containerLocationType", "distanceToStorage", "contSpecialRequirements", "needsForklift", "forkliftCount", "needsCrane", "craneCount", "carType", "servicePrices") FROM stdin;
00000000-0000-4000-8000-000000000012	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000002	00000000-0000-4000-8000-000000000003	00000000-0000-4000-8000-000000000003	f	SEED-FULL-SERVICE-001	BOC_XEP_THEO_CA	2026-09-21 16:00:00	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	t	f	HOP_DONG	Người liên hệ Seed	0900000004	Đơn dịch vụ mẫu Seed Full	CONFIRMED	\N	5000000.00	f	f	\N	\N	\N	t	10.00	500000.00	5500000.00	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[{"name": "Ca 4 giờ", "unit": "ca", "price": 5000000, "quantity": 1}]
\.


--
-- Data for Name: service_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_prices (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "serviceId", category, unit, price, quantity, "excessUnitPrice") FROM stdin;
00000000-0000-4000-8000-000000000011	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000010	Ca 4 giờ	ca	400000.00	4.00	100000.00
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, type, "autoQuote", icon, description) FROM stdin;
7b393338-00f6-4d8c-a898-338e015bdc64	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Thuê bốc xếp theo ca	BOC_XEP_THEO_CA	f	\N	\N
2da4e652-143f-4fe4-826c-9a8ebb2270e7	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Chuyển nhà + văn phòng trọn gói	CHUYEN_NHA_VAN_PHONG	f	\N	\N
65102738-2106-4fbe-8eda-650fbd53884c	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Phá dỡ hoàn trả mặt bằng	PHA_DO_HOAN_TRA	f	\N	\N
024212d5-56b2-4335-9a78-9b8b8209c925	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Vận chuyển vật tư	VAN_CHUYEN_VAT_TU	f	\N	\N
4a88425d-d38b-4c97-ab1e-1b275a177e2a	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Nâng hạ cont hàng	NANG_HA_CONT	f	\N	\N
48d0b13a-945d-47f4-a42d-80fa5e03c851	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Dịch vụ vận tải	DICH_VU_VAN_TAI	f	\N	\N
d904e937-fa04-4635-819e-b361f9295323	\N	\N	2026-09-21 11:29:49.514513	2026-09-21 11:29:49.514513	\N	\N	\N	Xe nâng, xe cẩu	XE_NANG_XE_CAU	f	\N	\N
00000000-0000-4000-8000-000000000010	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Bốc xếp theo ca - Seed Full	BOC_XEP_THEO_CA	t	\N	Dịch vụ mẫu để test API
\.


--
-- Data for Name: support_room_chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_room_chat_messages (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "supportRoomId", "senderUserId", "messageType", content, attachments, "timeAt", metadata) FROM stdin;
00000000-0000-4000-8000-000000000035	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000034	00000000-0000-4000-8000-000000000007	TEXT	Xin chào, chúng tôi đang hỗ trợ bạn.	\N	2026-09-21 16:00:00+07	\N
\.


--
-- Data for Name: support_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_rooms (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, "customerId", "hasUnreadMessages") FROM stdin;
00000000-0000-4000-8000-000000000034	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Phòng hỗ trợ Seed Full	00000000-0000-4000-8000-000000000005	t
\.


--
-- Data for Name: ticket_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_replies (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "userId", "ticketId", content, type, attachments, "isInternal") FROM stdin;
00000000-0000-4000-8000-000000000037	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000007	00000000-0000-4000-8000-000000000036	Bộ phận hỗ trợ đã tiếp nhận yêu cầu.	SUPPORT	\N	f
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "customerId", "serviceOrderId", type, priority, issue, description, "contactPhone", "preferredTime", status) FROM stdin;
00000000-0000-4000-8000-000000000036	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000012	OTHER	1	Yêu cầu hỗ trợ demo	Khách hàng cần kiểm tra lại lịch bốc xếp.	0900000004	09:00-10:00	OPEN
\.


--
-- Data for Name: time_keeping_confirms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_keeping_confirms (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "employeeId", "timeAt", "startAt", "endAt", "userId", "totalHours", "totalDayWorked", "totalSalary", "totalRealSalary", "totalAdvance", "totalMargin", "totalUniform", "totalPenalty", "totalBonus", "isPaid") FROM stdin;
00000000-0000-4000-8000-000000000028	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000003	2026-09-21 16:00:00+07	2026-09-21 16:00:00+07	2026-09-22 00:00:00+07	00000000-0000-4000-8000-000000000007	4.00	0.50	800000.00	800000.00	0.00	0.00	0.00	0.00	0.00	f
\.


--
-- Data for Name: time_keepings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_keepings (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "employeeId", "timeKeepingConfirmId", "orderEmployeeId", "timeAt", "startTime", "endTime", "totalHours", salary, "advanceSalaryId", "marginId", "referrerOrderId", "otherAmount", "otherAmountType", "isPaid", "isCollected", "incomeId", type, "referralEmployeeId", "referralConfigCode", "referralAppliedDate", "isRevenueShareAllocation", "revenueShareStartDate", "revenueShareEndDate", "allocateRevenueId") FROM stdin;
00000000-0000-4000-8000-000000000029	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000003	00000000-0000-4000-8000-000000000028	00000000-0000-4000-8000-000000000015	2026-09-21 16:00:00+07	09:00:00	13:00:00	4	800000.00	00000000-0000-4000-8000-000000000021	00000000-0000-4000-8000-000000000026	\N	0.00	\N	f	f	\N	IN	\N	\N	\N	f	\N	\N	00000000-0000-4000-8000-000000000027
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "userId", "refreshToken", "sessionType", "firebaseToken", "expiresAt") FROM stdin;
dd02442e-2393-4341-985b-9d6358c87c42	\N	\N	2026-09-21 11:29:52.156704	2026-09-21 11:29:52.156704	\N	\N	\N	08096023-4ebe-4bf7-8021-892db9890205	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwODA5NjAyMy00ZWJlLTRiZjctODAyMS04OTJkYjk4OTAyMDUiLCJyb2xlIjoiQURNSU4iLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1wbG95ZWVJZCI6IjM5MmY5ZWM1LTk1NzUtNDNhMi05Mzc5LTcwNmQ0ZWYxNmZiMCIsImN1c3RvbWVySWQiOm51bGwsImlhdCI6MTc4OTk2NDk5MiwiZXhwIjoxNzkwNTY5NzkyfQ.jvdf-qvDTAWrhjgiJvdWMRBjQWbDx06TQoyEZ3e2kkI	web	\N	2026-09-21 11:29:52.156704+07
00000000-0000-4000-8000-000000000060	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000007	seed-full-refresh-token	web	\N	2027-09-21 16:00:00+07
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", code, "financeId", type, "timeAt", amount) FROM stdin;
00000000-0000-4000-8000-000000000022	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	SEED-FULL-TRANS-001	00000000-0000-4000-8000-000000000020	IN	2026-09-21 16:00:00+07	1000000.00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "permissionGroupId", "employeeId", "customerId", code, username, password, role, phone, name, email, avatar, address, "isActive", setting, "otpCode", "otpExpiresAt", "referralCode") FROM stdin;
08096023-4ebe-4bf7-8021-892db9890205	\N	\N	2026-09-21 11:29:49.505561	2026-09-21 11:29:49.505561	\N	\N	\N	\N	392f9ec5-9575-43a2-9379-706d4ef16fb0	\N	ADMIN	admin	$2b$12$DpjcFU0tU32wZrD.v0F32ufRrM2ZQpgemX0HKBGnk5o84OWaeBRO6	ADMIN	0123456789	Admin	admin@itomo.vn	https://i.pravatar.cc/300?img=1	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
e0ff92ef-e701-4564-b8fd-9779c84910c2	\N	\N	2026-09-21 11:29:49.583947	2026-09-21 11:29:49.583947	\N	\N	\N	5fa0ef4a-eba3-4e04-9604-d30c74181c13	d7e64225-c6f5-469e-ab00-c8a72b457348	\N	NV-0004	nv-0004	123456	USER	\N	Lê Văn Công	\N	\N	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
ff2671ef-d6f5-41f0-a71b-1aefcf072686	\N	\N	2026-09-21 11:29:49.583947	2026-09-21 11:29:49.583947	\N	\N	\N	5fa0ef4a-eba3-4e04-9604-d30c74181c13	e93de671-1bbd-4a52-981d-9af686dec159	\N	NV-0005	nv-0005	123456	USER	\N	Phạm Thị Dung	\N	\N	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
492ad825-6d2c-408d-9e15-b67f14f74b19	\N	\N	2026-09-21 11:29:49.583947	2026-09-21 13:21:49.676749	\N	\N	\N	5fa0ef4a-eba3-4e04-9604-d30c74181c13	6e9aa4b0-a040-4b3e-bae9-cdb73f5b2788	\N	NV-0002	nv-0002	123456	USER	\N	Nguyễn Văn Nam	\N	\N	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
3345a199-f4c4-4b32-bddf-e9a75c0fc11d	\N	\N	2026-09-21 11:29:49.583947	2026-09-21 13:21:53.815905	\N	\N	\N	5fa0ef4a-eba3-4e04-9604-d30c74181c13	72a47a21-6d37-4abc-8a90-5fee7e198894	\N	NV-0003	nv-0003	123456	USER	\N	Trần Thị Bình	\N	\N	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
0d9ea5ed-fdb4-425c-8cb7-cdaee0d019e0	\N	\N	2026-09-21 13:25:30.30887	2026-09-21 13:25:30.30887	\N	\N	\N	\N	\N	c7f14287-103d-4b44-a212-c7fd81f58997	ND0006	0964631365	$2b$12$23zi9Wwdkjxse6cyRgCPe.Opa92pSjphByOzMZSfwP3Snh.BgAEnu	USER	\N	khách hàng test	\N	\N	{}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
00000000-0000-4000-8000-000000000007	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000001	00000000-0000-4000-8000-000000000003	\N	SEED-FULL-ADMIN	seedadmin	$2b$12$mALo45s3bPYAvuPvjdzk9OYkOTZQqMEBhgA7v0mmvNc568U.57fsa	ADMIN	0900000005	Admin Seed Full	seed.admin@example.com	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
00000000-0000-4000-8000-000000000008	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000001	00000000-0000-4000-8000-000000000004	\N	SEED-FULL-ACCOUNTANT	seedaccountant	$2b$12$mALo45s3bPYAvuPvjdzk9OYkOTZQqMEBhgA7v0mmvNc568U.57fsa	EMPLOYEE	0900000006	Kế toán Seed Full	seed.accountant.user@example.com	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
00000000-0000-4000-8000-000000000006	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	\N	\N	00000000-0000-4000-8000-000000000005	SEED-FULL-CUS-USER	seedcustomer	$2b$12$mALo45s3bPYAvuPvjdzk9OYkOTZQqMEBhgA7v0mmvNc568U.57fsa	USER	0900000004	Khách hàng Seed Full	seed.customer@example.com	\N	{"ward": "Cau Giay", "state": "Ha Noi", "detail": "Kho demo seed full", "country": "Viet Nam"}	t	{"region": {"country": "Vietnam", "language": "vi", "timezone": "Asia/Ho_Chi_Minh"}, "dateFormat": {"date": "DD/MM/YYYY", "time": "HH:mm:ss", "displayTime": "24h"}, "numberFormat": {"decimal": ".", "fraction": "2", "thousand": ","}, "currencyFormat": {"symbol": "₫", "fraction": "0", "position": "after"}}	\N	\N	\N
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "userId", "customerId", "vouchersTemplateId", code, "redeemedAt", "expiredAt", "isUsed", "usedAt") FROM stdin;
00000000-0000-4000-8000-000000000046	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000006	00000000-0000-4000-8000-000000000005	00000000-0000-4000-8000-000000000045	SEED-FULL-VOUCHER-001	2026-09-21 16:00:00	2027-09-21 16:00:00	f	\N
\.


--
-- Data for Name: vouchers_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers_templates (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, code, points, amount, status) FROM stdin;
00000000-0000-4000-8000-000000000045	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Voucher Seed Full	SEED-FULL-VOUCHER-TPL	100	100000.00	ACTIVE
\.


--
-- Data for Name: zalo_message_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zalo_message_histories (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", "orderId", "customerId", "templateId", "templateName", "templateType", phone, "msgId", status, "errorCode", "errorMessage", "templateData", "requestPayload", "sentAt") FROM stdin;
00000000-0000-4000-8000-000000000048	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	00000000-0000-4000-8000-000000000013	00000000-0000-4000-8000-000000000005	100001	Thông báo tạo đơn Seed Full	CREATE	0900000004	SEED-FULL-ZALO-MSG-001	SENT	\N	\N	{"orderCode": "SEED-FULL-ORDER-001"}	{"demo": true}	2026-09-21 16:00:00+07
\.


--
-- Data for Name: zalo_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zalo_templates (id, "tempId", note, "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt", name, type, "templateId") FROM stdin;
00000000-0000-4000-8000-000000000047	\N	\N	2026-09-21 14:41:45.753399	2026-09-21 14:41:45.753399	\N	\N	\N	Thông báo tạo đơn Seed Full	CREATE	SEED-FULL-ZALO-001
\.


--
-- Name: expense_approvals PK_01be3ec916c6a30688988952003; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_approvals
    ADD CONSTRAINT "PK_01be3ec916c6a30688988952003" PRIMARY KEY (id);


--
-- Name: order_comment_read_states PK_0bef2ca6bd3c3fd237ddaa8dd39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comment_read_states
    ADD CONSTRAINT "PK_0bef2ca6bd3c3fd237ddaa8dd39" PRIMARY KEY (id);


--
-- Name: rag_documents PK_0c27c0f160af990a817ba71c32a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rag_documents
    ADD CONSTRAINT "PK_0c27c0f160af990a817ba71c32a" PRIMARY KEY (id);


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: service_order_chat_messages PK_1548be4e48332af9bbb15f80138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_messages
    ADD CONSTRAINT "PK_1548be4e48332af9bbb15f80138" PRIMARY KEY (id);


--
-- Name: service_order_chat_participants PK_22416b925f6071b80e3ae522c0e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_participants
    ADD CONSTRAINT "PK_22416b925f6071b80e3ae522c0e" PRIMARY KEY (id);


--
-- Name: order_details PK_278a6e0f21c9db1653e6f406801; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY (id);


--
-- Name: employee_ticket_participants PK_2e800b32862c207aaa5af7d66f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_participants
    ADD CONSTRAINT "PK_2e800b32862c207aaa5af7d66f0" PRIMARY KEY (id);


--
-- Name: tokens PK_3001e89ada36263dabf1fb6210a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY (id);


--
-- Name: attributes PK_32216e2e61830211d3a5d7fa72c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT "PK_32216e2e61830211d3a5d7fa72c" PRIMARY KEY (id);


--
-- Name: order_manager_locations PK_33d3d3e67c5f3b7c9a0ea33fadf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_manager_locations
    ADD CONSTRAINT "PK_33d3d3e67c5f3b7c9a0ea33fadf" PRIMARY KEY (id);


--
-- Name: tickets PK_343bc942ae261cf7a1377f48fd0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY (id);


--
-- Name: vouchers_templates PK_3d0274b160c172f5c23391df920; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers_templates
    ADD CONSTRAINT "PK_3d0274b160c172f5c23391df920" PRIMARY KEY (id);


--
-- Name: fund_transactions PK_3f55fdfd418d043b0d38a2e7043; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT "PK_3f55fdfd418d043b0d38a2e7043" PRIMARY KEY (id);


--
-- Name: app_settings PK_4800b266ba790931744b3e53a74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT "PK_4800b266ba790931744b3e53a74" PRIMARY KEY (id);


--
-- Name: debts PK_4bd9f54aab9e59628a3a2657fa1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT "PK_4bd9f54aab9e59628a3a2657fa1" PRIMARY KEY (id);


--
-- Name: order_employees PK_5d2e52b7a8dfce05cadccef8e37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_employees
    ADD CONSTRAINT "PK_5d2e52b7a8dfce05cadccef8e37" PRIMARY KEY (id);


--
-- Name: invoices PK_668cef7c22a427fd822cc1be3ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: ticket_replies PK_6ab133db0068322c649e89fc019; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT "PK_6ab133db0068322c649e89fc019" PRIMARY KEY (id);


--
-- Name: files PK_6c16b9093a142e0e7613b04a3d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY (id);


--
-- Name: call_histories PK_6ed08e345af42ee39a1adb10807; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_histories
    ADD CONSTRAINT "PK_6ed08e345af42ee39a1adb10807" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: notification_details PK_74e992630ba6fc7292071e3387f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_details
    ADD CONSTRAINT "PK_74e992630ba6fc7292071e3387f" PRIMARY KEY (id);


--
-- Name: time_keeping_confirms PK_78f0b22aed27fc4afbb3d996bf6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keeping_confirms
    ADD CONSTRAINT "PK_78f0b22aed27fc4afbb3d996bf6" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: service_order_ratings PK_7fde0e5d3ee0159d8194095de6d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_ratings
    ADD CONSTRAINT "PK_7fde0e5d3ee0159d8194095de6d" PRIMARY KEY (id);


--
-- Name: order_leader_chats PK_8344e27aa661f02afa8b8b378a3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chats
    ADD CONSTRAINT "PK_8344e27aa661f02afa8b8b378a3" PRIMARY KEY (id);


--
-- Name: support_room_chat_messages PK_8d4f67229cf94e12361b18737ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_room_chat_messages
    ADD CONSTRAINT "PK_8d4f67229cf94e12361b18737ad" PRIMARY KEY (id);


--
-- Name: service_orders PK_914aa74962ee83b10614ea2095d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "PK_914aa74962ee83b10614ea2095d" PRIMARY KEY (id);


--
-- Name: zalo_templates PK_a0a16644e44abd11fc18f623af4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zalo_templates
    ADD CONSTRAINT "PK_a0a16644e44abd11fc18f623af4" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: time_keepings PK_a7db41a877b9c26ec8e5c813165; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "PK_a7db41a877b9c26ec8e5c813165" PRIMARY KEY (id);


--
-- Name: allocate_revenue PK_adac3630f2902076efd25d78806; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allocate_revenue
    ADD CONSTRAINT "PK_adac3630f2902076efd25d78806" PRIMARY KEY (id);


--
-- Name: reward_points PK_b04907622cbfc5e492056cfc72c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_points
    ADD CONSTRAINT "PK_b04907622cbfc5e492056cfc72c" PRIMARY KEY (id);


--
-- Name: announcements PK_b3ad760876ff2e19d58e05dc8b0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY (id);


--
-- Name: file_uploads PK_b3ebfc99a8b660f0bc64a052b42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT "PK_b3ebfc99a8b660f0bc64a052b42" PRIMARY KEY (id);


--
-- Name: employees PK_b9535a98350d5b26e7eb0c26af4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY (id);


--
-- Name: services PK_ba2d347a3168a296416c6c5ccb2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY (id);


--
-- Name: margins PK_c09afde434626e11e00e10b61f1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.margins
    ADD CONSTRAINT "PK_c09afde434626e11e00e10b61f1" PRIMARY KEY (id);


--
-- Name: call_navigations PK_c8be783510bc3fdd531bb414405; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_navigations
    ADD CONSTRAINT "PK_c8be783510bc3fdd531bb414405" PRIMARY KEY (id);


--
-- Name: zalo_message_histories PK_cf3c64428d9856e3f7e70a32956; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zalo_message_histories
    ADD CONSTRAINT "PK_cf3c64428d9856e3f7e70a32956" PRIMARY KEY (id);


--
-- Name: customer_cares PK_cf9abb19834e840a03ef28b05ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_cares
    ADD CONSTRAINT "PK_cf9abb19834e840a03ef28b05ee" PRIMARY KEY (id);


--
-- Name: service_prices PK_d03695e32fe299c7b53f7775804; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_prices
    ADD CONSTRAINT "PK_d03695e32fe299c7b53f7775804" PRIMARY KEY (id);


--
-- Name: order_comments PK_d489c043c9801f1d4728e07e55e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comments
    ADD CONSTRAINT "PK_d489c043c9801f1d4728e07e55e" PRIMARY KEY (id);


--
-- Name: funds PK_d785f4bb8f680f3febd40718f68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT "PK_d785f4bb8f680f3febd40718f68" PRIMARY KEY (id);


--
-- Name: order_leader_chat_read_states PK_dbc1019673d1beae7453374502b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chat_read_states
    ADD CONSTRAINT "PK_dbc1019673d1beae7453374502b" PRIMARY KEY (id);


--
-- Name: order_leaders PK_dca9ae0ad2dc0ce81f7d3c31564; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leaders
    ADD CONSTRAINT "PK_dca9ae0ad2dc0ce81f7d3c31564" PRIMARY KEY (id);


--
-- Name: finances PK_dd84717ec8f1c29d8dd8687b6fd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "PK_dd84717ec8f1c29d8dd8687b6fd" PRIMARY KEY (id);


--
-- Name: permission_groups PK_e6d3b6dc86109f8149c4d6c5400; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_groups
    ADD CONSTRAINT "PK_e6d3b6dc86109f8149c4d6c5400" PRIMARY KEY (id);


--
-- Name: support_rooms PK_e6e1fc354d53ce39c888ff8de76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_rooms
    ADD CONSTRAINT "PK_e6e1fc354d53ce39c888ff8de76" PRIMARY KEY (id);


--
-- Name: vouchers PK_ed1b7dd909a696560763acdbc04; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "PK_ed1b7dd909a696560763acdbc04" PRIMARY KEY (id);


--
-- Name: employee_ticket_replies PK_f98b8a7edc0a2a73e2b3275d0f3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_replies
    ADD CONSTRAINT "PK_f98b8a7edc0a2a73e2b3275d0f3" PRIMARY KEY (id);


--
-- Name: employee_tickets PK_fae163d22450d6c37e5e44febdd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_tickets
    ADD CONSTRAINT "PK_fae163d22450d6c37e5e44febdd" PRIMARY KEY (id);


--
-- Name: time_keepings REL_264f64946d96e135950b58190a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "REL_264f64946d96e135950b58190a" UNIQUE ("advanceSalaryId");


--
-- Name: time_keepings REL_85fed817039f441bf277cd16f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "REL_85fed817039f441bf277cd16f0" UNIQUE ("orderEmployeeId");


--
-- Name: orders REL_8f990b348a3147141efc2a3a14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "REL_8f990b348a3147141efc2a3a14" UNIQUE ("serviceOrderId");


--
-- Name: support_rooms REL_90551e742e21f6cf10792b2a4b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_rooms
    ADD CONSTRAINT "REL_90551e742e21f6cf10792b2a4b" UNIQUE ("customerId");


--
-- Name: users REL_a7191f881489123fab6c8e5273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "REL_a7191f881489123fab6c8e5273" UNIQUE ("employeeId");


--
-- Name: users REL_c6c520dfb9a4d6dd749e73b13d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "REL_c6c520dfb9a4d6dd749e73b13d" UNIQUE ("customerId");


--
-- Name: finances REL_ef9e7898bc77af6ba71116ef61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "REL_ef9e7898bc77af6ba71116ef61" UNIQUE ("timeKeepingConfirmId");


--
-- Name: attributes UQ_0bd1e73335a197a6f55e3e7e12d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT "UQ_0bd1e73335a197a6f55e3e7e12d" UNIQUE (name, type);


--
-- Name: vouchers_templates UQ_3bc207da254269acedf2b3e5381; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers_templates
    ADD CONSTRAINT "UQ_3bc207da254269acedf2b3e5381" UNIQUE (code);


--
-- Name: debts UQ_50130306d739007d339fec8d0c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT "UQ_50130306d739007d339fec8d0c4" UNIQUE ("orderId");


--
-- Name: zalo_templates UQ_5ea8b1ecc2a1446540678b48fd8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zalo_templates
    ADD CONSTRAINT "UQ_5ea8b1ecc2a1446540678b48fd8" UNIQUE (type);


--
-- Name: fund_transactions UQ_a282680921c60bb552644aeae98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT "UQ_a282680921c60bb552644aeae98" UNIQUE (code);


--
-- Name: files UQ_ea1da54d986115b89c88939788c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "UQ_ea1da54d986115b89c88939788c" UNIQUE ("fileName");


--
-- Name: vouchers UQ_efc30b2b9169e05e0e1e19d6dd6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "UQ_efc30b2b9169e05e0e1e19d6dd6" UNIQUE (code);


--
-- Name: IDX_call_histories_orderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_call_histories_orderId" ON public.call_histories USING btree ("orderId");


--
-- Name: IDX_customer_cares_customer_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_cares_customer_scheduled" ON public.customer_cares USING btree ("customerId", "scheduledAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_debts_customerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_debts_customerId" ON public.debts USING btree ("customerId");


--
-- Name: IDX_debts_financeId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_debts_financeId" ON public.debts USING btree ("financeId");


--
-- Name: IDX_debts_orderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_debts_orderId" ON public.debts USING btree ("orderId");


--
-- Name: IDX_debts_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_debts_timeAt" ON public.debts USING btree ("timeAt");


--
-- Name: IDX_employee_ticket_participants_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_employee_ticket_participants_active" ON public.employee_ticket_participants USING btree ("employeeTicketId", "userId") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_employee_ticket_participants_ticketId_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_employee_ticket_participants_ticketId_active" ON public.employee_ticket_participants USING btree ("employeeTicketId") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_employee_ticket_participants_userId_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_employee_ticket_participants_userId_active" ON public.employee_ticket_participants USING btree ("userId") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_order_comments_active_order_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_comments_active_order_created" ON public.order_comments USING btree ("orderId", "createdAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_order_leader_chats_active_order_time_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_leader_chats_active_order_time_id" ON public.order_leader_chats USING btree ("orderId", "timeAt", id) WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_order_leader_chats_active_order_user_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_leader_chats_active_order_user_time" ON public.order_leader_chats USING btree ("orderId", "userId", "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_order_manager_locations_active_employee_capturedAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_manager_locations_active_employee_capturedAt" ON public.order_manager_locations USING btree ("employeeId", "capturedAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_order_manager_locations_active_order_capturedAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_manager_locations_active_order_capturedAt" ON public.order_manager_locations USING btree ("orderId", "capturedAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_active_branch_status_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_active_branch_status_timeAt" ON public.orders USING btree ("branchId", status, "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_active_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_active_code" ON public.orders USING btree (code) WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_active_customer_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_active_customer_timeAt" ON public.orders USING btree ("customerId", "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_active_referrer_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_active_referrer_timeAt" ON public.orders USING btree ("referrerId", "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_active_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_active_timeAt" ON public.orders USING btree ("timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_orders_branchId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_branchId" ON public.orders USING btree ("branchId");


--
-- Name: IDX_orders_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_code" ON public.orders USING btree (code);


--
-- Name: IDX_orders_customerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_customerId" ON public.orders USING btree ("customerId");


--
-- Name: IDX_orders_pending_calculation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_pending_calculation" ON public.orders USING btree ("calculationVersion", "calculatedVersion") WHERE (("deletedAt" IS NULL) AND ("calculationVersion" > "calculatedVersion"));


--
-- Name: IDX_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_status" ON public.orders USING btree (status);


--
-- Name: IDX_orders_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_orders_timeAt" ON public.orders USING btree ("timeAt");


--
-- Name: IDX_service_order_chat_messages_active_serviceOrder_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_order_chat_messages_active_serviceOrder_timeAt" ON public.service_order_chat_messages USING btree ("serviceOrderId", "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_service_order_chat_participants_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_service_order_chat_participants_active" ON public.service_order_chat_participants USING btree ("serviceOrderId", "userId") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_service_orders_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_orders_code" ON public.service_orders USING btree (code);


--
-- Name: IDX_support_room_chat_messages_active_supportRoom_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_support_room_chat_messages_active_supportRoom_timeAt" ON public.support_room_chat_messages USING btree ("supportRoomId", "timeAt") WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_timeKeepings_advanceSalaryId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_advanceSalaryId" ON public.time_keepings USING btree ("advanceSalaryId");


--
-- Name: IDX_timeKeepings_allocateRevenueId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_allocateRevenueId" ON public.time_keepings USING btree ("allocateRevenueId");


--
-- Name: IDX_timeKeepings_employeeId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_employeeId" ON public.time_keepings USING btree ("employeeId");


--
-- Name: IDX_timeKeepings_marginId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_marginId" ON public.time_keepings USING btree ("marginId");


--
-- Name: IDX_timeKeepings_orderEmployeeId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_orderEmployeeId" ON public.time_keepings USING btree ("orderEmployeeId");


--
-- Name: IDX_timeKeepings_referralAppliedDate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_referralAppliedDate" ON public.time_keepings USING btree ("referralAppliedDate");


--
-- Name: IDX_timeKeepings_referrerOrderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_referrerOrderId" ON public.time_keepings USING btree ("referrerOrderId");


--
-- Name: IDX_timeKeepings_timeAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_timeAt" ON public.time_keepings USING btree ("timeAt");


--
-- Name: IDX_timeKeepings_timeKeepingConfirmId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_timeKeepings_timeKeepingConfirmId" ON public.time_keepings USING btree ("timeKeepingConfirmId");


--
-- Name: IDX_vouchers_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_vouchers_code" ON public.vouchers USING btree (code);


--
-- Name: IDX_vouchers_templates_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_vouchers_templates_code" ON public.vouchers_templates USING btree (code);


--
-- Name: UQ_order_comment_read_states_order_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UQ_order_comment_read_states_order_user" ON public.order_comment_read_states USING btree ("orderId", "userId") WHERE ("deletedAt" IS NULL);


--
-- Name: UQ_order_leader_chat_read_states_order_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UQ_order_leader_chat_read_states_order_user" ON public.order_leader_chat_read_states USING btree ("orderId", "userId") WHERE ("deletedAt" IS NULL);


--
-- Name: time_keepings FK_03a46b7252695be1b87260d5fd8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_03a46b7252695be1b87260d5fd8" FOREIGN KEY ("allocateRevenueId") REFERENCES public.allocate_revenue(id) ON DELETE SET NULL;


--
-- Name: vouchers FK_0492799cd14fae511b856c8984a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "FK_0492799cd14fae511b856c8984a" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: margins FK_0522c7813fe59f85c8356538892; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.margins
    ADD CONSTRAINT "FK_0522c7813fe59f85c8356538892" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: order_manager_locations FK_0750886fc0adac7447c862e729a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_manager_locations
    ADD CONSTRAINT "FK_0750886fc0adac7447c862e729a" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: finances FK_0768bbc5c4bcc4f9a071b084602; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_0768bbc5c4bcc4f9a071b084602" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: order_leader_chats FK_0814abb60be0a6e149668faa315; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chats
    ADD CONSTRAINT "FK_0814abb60be0a6e149668faa315" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: service_orders FK_0cacf2265c94bd0c900a028310d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "FK_0cacf2265c94bd0c900a028310d" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: employees FK_0ee1fa8d2cfe91f9dac54f9e2ff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: employees FK_114e0dcfc1b75a6e39ff7115dab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_114e0dcfc1b75a6e39ff7115dab" FOREIGN KEY ("managerId") REFERENCES public.employees(id);


--
-- Name: order_details FK_147bc15de4304f89a93c7eee969; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT "FK_147bc15de4304f89a93c7eee969" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: invoices FK_1df049f8943c6be0c1115541efb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_1df049f8943c6be0c1115541efb" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: invoices FK_1e60c34407bf8d83ae612cc079d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_1e60c34407bf8d83ae612cc079d" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: order_manager_locations FK_21764b908b4565392a4e84e0ed3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_manager_locations
    ADD CONSTRAINT "FK_21764b908b4565392a4e84e0ed3" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: order_leader_chats FK_233667f8c274e2c0dad20cd3a12; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chats
    ADD CONSTRAINT "FK_233667f8c274e2c0dad20cd3a12" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: customer_cares FK_2357faf255fdce62db23299fd0f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_cares
    ADD CONSTRAINT "FK_2357faf255fdce62db23299fd0f" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: order_comments FK_251bb967b69c9d0b8cabb8d846e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comments
    ADD CONSTRAINT "FK_251bb967b69c9d0b8cabb8d846e" FOREIGN KEY ("replyCommentId") REFERENCES public.order_comments(id);


--
-- Name: time_keepings FK_264f64946d96e135950b58190a9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_264f64946d96e135950b58190a9" FOREIGN KEY ("advanceSalaryId") REFERENCES public.finances(id);


--
-- Name: finances FK_29d58d04e6b88654ede43247667; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_29d58d04e6b88654ede43247667" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: service_order_chat_participants FK_30808b8cdb154a7f49120b7022d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_participants
    ADD CONSTRAINT "FK_30808b8cdb154a7f49120b7022d" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: service_orders FK_32884a16eec8c31b4d39dc73765; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "FK_32884a16eec8c31b4d39dc73765" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: invoices FK_3373a53ffa4842289ae025d99b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_3373a53ffa4842289ae025d99b3" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: call_histories FK_3461f98f822b99aaf9b60389ad2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_histories
    ADD CONSTRAINT "FK_3461f98f822b99aaf9b60389ad2" FOREIGN KEY ("receiverId") REFERENCES public.users(id);


--
-- Name: reward_points FK_368d4b3067c85cb00fea060f2e9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_points
    ADD CONSTRAINT "FK_368d4b3067c85cb00fea060f2e9" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: vouchers FK_382472ec961c3f80aefb8c24a0c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "FK_382472ec961c3f80aefb8c24a0c" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: fund_transactions FK_3b734c4ed85bb1a35a0a5071b8c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT "FK_3b734c4ed85bb1a35a0a5071b8c" FOREIGN KEY ("fundId") REFERENCES public.funds(id);


--
-- Name: zalo_message_histories FK_3b94a909339fc3b5c7c63f31008; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zalo_message_histories
    ADD CONSTRAINT "FK_3b94a909339fc3b5c7c63f31008" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: order_comment_read_states FK_46579012180dcb54aac747f0f78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comment_read_states
    ADD CONSTRAINT "FK_46579012180dcb54aac747f0f78" FOREIGN KEY ("lastReadCommentId") REFERENCES public.order_comments(id) ON DELETE SET NULL;


--
-- Name: order_comment_read_states FK_48ad3e8664ee4d90c2d7a422a34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comment_read_states
    ADD CONSTRAINT "FK_48ad3e8664ee4d90c2d7a422a34" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: call_navigations FK_492d12e3301a48818151966751a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_navigations
    ADD CONSTRAINT "FK_492d12e3301a48818151966751a" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: ticket_replies FK_4ad4ae300ad5118e747a50ea2a2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT "FK_4ad4ae300ad5118e747a50ea2a2" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: service_order_ratings FK_4e2e313876ab3e7654e4d8abda9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_ratings
    ADD CONSTRAINT "FK_4e2e313876ab3e7654e4d8abda9" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: debts FK_50130306d739007d339fec8d0c4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT "FK_50130306d739007d339fec8d0c4" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: employee_ticket_participants FK_51f923e74044d589fb583753a89; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_participants
    ADD CONSTRAINT "FK_51f923e74044d589fb583753a89" FOREIGN KEY ("removedByUserId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: service_order_chat_messages FK_5218f4c9e56020b8cc9ab57bd1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_messages
    ADD CONSTRAINT "FK_5218f4c9e56020b8cc9ab57bd1a" FOREIGN KEY ("serviceOrderId") REFERENCES public.service_orders(id) ON DELETE CASCADE;


--
-- Name: customer_cares FK_53fd806f718b667a61b31eef8c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_cares
    ADD CONSTRAINT "FK_53fd806f718b667a61b31eef8c2" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: time_keeping_confirms FK_54faf5132d905d7ca16c074696d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keeping_confirms
    ADD CONSTRAINT "FK_54faf5132d905d7ca16c074696d" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: employee_ticket_participants FK_5bfa336a87973a72d59aeaef093; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_participants
    ADD CONSTRAINT "FK_5bfa336a87973a72d59aeaef093" FOREIGN KEY ("employeeTicketId") REFERENCES public.employee_tickets(id) ON DELETE CASCADE;


--
-- Name: order_leader_chats FK_5cdc86f247cae38c9e270b9bc47; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chats
    ADD CONSTRAINT "FK_5cdc86f247cae38c9e270b9bc47" FOREIGN KEY ("replyMessageId") REFERENCES public.order_leader_chats(id) ON DELETE SET NULL;


--
-- Name: order_leaders FK_5e04ccd1ff407090bd4f24f902a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leaders
    ADD CONSTRAINT "FK_5e04ccd1ff407090bd4f24f902a" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: service_orders FK_61698399b005786f97ba8a90a74; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "FK_61698399b005786f97ba8a90a74" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: users FK_64934bf3d021bb3a641c9f8396d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_64934bf3d021bb3a641c9f8396d" FOREIGN KEY ("permissionGroupId") REFERENCES public.permission_groups(id);


--
-- Name: employees FK_653da615df4d5de6628a227823a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_653da615df4d5de6628a227823a" FOREIGN KEY ("recruiterId") REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: service_orders FK_668899c89a48f9cfe60658c2942; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "FK_668899c89a48f9cfe60658c2942" FOREIGN KEY ("branchManagerId") REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: zalo_message_histories FK_6768dae33ac8623bdc44013fe50; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zalo_message_histories
    ADD CONSTRAINT "FK_6768dae33ac8623bdc44013fe50" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: call_navigations FK_676da352f59d2c299c516c06f95; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_navigations
    ADD CONSTRAINT "FK_676da352f59d2c299c516c06f95" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: ticket_replies FK_6983c82029e4e2097d6cd5d5bf7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT "FK_6983c82029e4e2097d6cd5d5bf7" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id);


--
-- Name: order_leaders FK_6afd8280b5fdb88f0260d7480b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leaders
    ADD CONSTRAINT "FK_6afd8280b5fdb88f0260d7480b3" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: service_order_chat_messages FK_6c3a3da00f823dfa90261189ca7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_messages
    ADD CONSTRAINT "FK_6c3a3da00f823dfa90261189ca7" FOREIGN KEY ("senderUserId") REFERENCES public.users(id);


--
-- Name: tickets FK_6fabd2e755ed5d8bc2466da4e2b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "FK_6fabd2e755ed5d8bc2466da4e2b" FOREIGN KEY ("serviceOrderId") REFERENCES public.service_orders(id) ON DELETE SET NULL;


--
-- Name: order_leader_chat_read_states FK_756f9b9c5c68f85b5ef442cd3a4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chat_read_states
    ADD CONSTRAINT "FK_756f9b9c5c68f85b5ef442cd3a4" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders FK_7676d9500aa156664520b6feb0e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_7676d9500aa156664520b6feb0e" FOREIGN KEY ("createdByEmployeeId") REFERENCES public.employees(id);


--
-- Name: order_comment_read_states FK_79d7d77f506dfa83cd03f1cd6f7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comment_read_states
    ADD CONSTRAINT "FK_79d7d77f506dfa83cd03f1cd6f7" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: tickets FK_7a1f978a1c1a6b2b1133014b4b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "FK_7a1f978a1c1a6b2b1133014b4b2" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: call_histories FK_7d93b3662f5913b92e19c475791; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_histories
    ADD CONSTRAINT "FK_7d93b3662f5913b92e19c475791" FOREIGN KEY ("callerId") REFERENCES public.users(id);


--
-- Name: orders FK_7dd87a139c4230261304215f77c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_7dd87a139c4230261304215f77c" FOREIGN KEY ("referrerId") REFERENCES public.employees(id);


--
-- Name: order_comments FK_80cf3d4fc7ef7aa139ae49cb42a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comments
    ADD CONSTRAINT "FK_80cf3d4fc7ef7aa139ae49cb42a" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: time_keepings FK_85fed817039f441bf277cd16f0b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_85fed817039f441bf277cd16f0b" FOREIGN KEY ("orderEmployeeId") REFERENCES public.order_employees(id) ON DELETE CASCADE;


--
-- Name: orders FK_873d9661d948ee484150cf4c73d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_873d9661d948ee484150cf4c73d" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: employee_ticket_replies FK_890d871b7c3a8a3338ed5415db8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_replies
    ADD CONSTRAINT "FK_890d871b7c3a8a3338ed5415db8" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: orders FK_8f990b348a3147141efc2a3a147; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_8f990b348a3147141efc2a3a147" FOREIGN KEY ("serviceOrderId") REFERENCES public.service_orders(id) ON DELETE SET NULL;


--
-- Name: support_rooms FK_90551e742e21f6cf10792b2a4b1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_rooms
    ADD CONSTRAINT "FK_90551e742e21f6cf10792b2a4b1" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: orders FK_9135f6e57e30fa8b570cbad51bb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_9135f6e57e30fa8b570cbad51bb" FOREIGN KEY ("branchManagerId") REFERENCES public.employees(id);


--
-- Name: employee_ticket_replies FK_93dc156b2cb7575027fb9a77743; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_replies
    ADD CONSTRAINT "FK_93dc156b2cb7575027fb9a77743" FOREIGN KEY ("employeeTicketId") REFERENCES public.employee_tickets(id) ON DELETE CASCADE;


--
-- Name: debts FK_94d39f01012380a19f966217a82; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT "FK_94d39f01012380a19f966217a82" FOREIGN KEY ("financeId") REFERENCES public.finances(id);


--
-- Name: debts FK_973cb56beac7c34984fb6f9a060; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT "FK_973cb56beac7c34984fb6f9a060" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: call_navigations FK_98792e1821af59a7bdd7a0d39df; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_navigations
    ADD CONSTRAINT "FK_98792e1821af59a7bdd7a0d39df" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: margins FK_989e36330b1da2c7d6a98e68a23; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.margins
    ADD CONSTRAINT "FK_989e36330b1da2c7d6a98e68a23" FOREIGN KEY ("expenseApprovalId") REFERENCES public.expense_approvals(id);


--
-- Name: finances FK_9c6dbfd3ed49f3fdec9df8bec32; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_9c6dbfd3ed49f3fdec9df8bec32" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: employee_ticket_participants FK_a11f9a9c1ef343b2b64afe5c8a7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_participants
    ADD CONSTRAINT "FK_a11f9a9c1ef343b2b64afe5c8a7" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: finances FK_a1bb38d25d014fb751e8841177c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_a1bb38d25d014fb751e8841177c" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: time_keepings FK_a246f8e80adb6c0329b734a7ea7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_a246f8e80adb6c0329b734a7ea7" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: order_comments FK_a296198dec9ee25dd4e3d3cacd2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_comments
    ADD CONSTRAINT "FK_a296198dec9ee25dd4e3d3cacd2" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: invoices FK_a58a78a0e0031dd93a2f56f1e8e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_a58a78a0e0031dd93a2f56f1e8e" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: users FK_a7191f881489123fab6c8e52738; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_a7191f881489123fab6c8e52738" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: margins FK_a94c32fcec464c0a9ef1e601593; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.margins
    ADD CONSTRAINT "FK_a94c32fcec464c0a9ef1e601593" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: branches FK_aabfa848248a75dc96d8df026be; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "FK_aabfa848248a75dc96d8df026be" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: service_prices FK_abaebbeda21486c07d2da015c7d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_prices
    ADD CONSTRAINT "FK_abaebbeda21486c07d2da015c7d" FOREIGN KEY ("serviceId") REFERENCES public.services(id);


--
-- Name: margins FK_add09662f37a8c126583b713e4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.margins
    ADD CONSTRAINT "FK_add09662f37a8c126583b713e4e" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: employee_tickets FK_b4c0557e79f238b1e882a2ac848; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_tickets
    ADD CONSTRAINT "FK_b4c0557e79f238b1e882a2ac848" FOREIGN KEY ("createdByUserId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: notification_details FK_b4d2d1df4542525903344185c43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_details
    ADD CONSTRAINT "FK_b4d2d1df4542525903344185c43" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id);


--
-- Name: call_histories FK_b5cd65b7fcb0f553b6f55e30ac0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.call_histories
    ADD CONSTRAINT "FK_b5cd65b7fcb0f553b6f55e30ac0" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: order_leader_chat_read_states FK_c1183cd3ce1384c844cf2f3a135; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chat_read_states
    ADD CONSTRAINT "FK_c1183cd3ce1384c844cf2f3a135" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_ticket_participants FK_c3846c3c90743001e3e36ab3c34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ticket_participants
    ADD CONSTRAINT "FK_c3846c3c90743001e3e36ab3c34" FOREIGN KEY ("addedByUserId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: users FK_c6c520dfb9a4d6dd749e73b13de; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_c6c520dfb9a4d6dd749e73b13de" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: expense_approvals FK_c7ce413c33ad0871479580024e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_approvals
    ADD CONSTRAINT "FK_c7ce413c33ad0871479580024e8" FOREIGN KEY ("requestedBy") REFERENCES public.users(id);


--
-- Name: support_room_chat_messages FK_c8996655033116f12895ff4fcc6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_room_chat_messages
    ADD CONSTRAINT "FK_c8996655033116f12895ff4fcc6" FOREIGN KEY ("supportRoomId") REFERENCES public.support_rooms(id) ON DELETE CASCADE;


--
-- Name: finances FK_c8b10af124ef9a7a2ff1f3b8631; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_c8b10af124ef9a7a2ff1f3b8631" FOREIGN KEY ("expenseApprovalId") REFERENCES public.expense_approvals(id);


--
-- Name: time_keepings FK_cc7d3fc2f130c65d0247487fa94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_cc7d3fc2f130c65d0247487fa94" FOREIGN KEY ("timeKeepingConfirmId") REFERENCES public.time_keeping_confirms(id);


--
-- Name: orders FK_cd734c3324468eabd7c3d37e6db; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_cd734c3324468eabd7c3d37e6db" FOREIGN KEY ("completedByEmployeeId") REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: order_leader_chat_read_states FK_cd9e843ea029ccae406ea69f368; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leader_chat_read_states
    ADD CONSTRAINT "FK_cd9e843ea029ccae406ea69f368" FOREIGN KEY ("lastReadMessageId") REFERENCES public.order_leader_chats(id) ON DELETE SET NULL;


--
-- Name: notification_details FK_cee4acec2e23bcbaaee5fd85289; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_details
    ADD CONSTRAINT "FK_cee4acec2e23bcbaaee5fd85289" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: tokens FK_d417e5d35f2434afc4bd48cb4d2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: support_room_chat_messages FK_d859f46d720be148f2c3741af23; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_room_chat_messages
    ADD CONSTRAINT "FK_d859f46d720be148f2c3741af23" FOREIGN KEY ("senderUserId") REFERENCES public.users(id);


--
-- Name: vouchers FK_d90579198e804b31340e0bddc5f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "FK_d90579198e804b31340e0bddc5f" FOREIGN KEY ("vouchersTemplateId") REFERENCES public.vouchers_templates(id);


--
-- Name: reward_points FK_db11512a69e118a694f0b2855c7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_points
    ADD CONSTRAINT "FK_db11512a69e118a694f0b2855c7" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: order_employees FK_dd8abd7d31569433ded80a1f395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_employees
    ADD CONSTRAINT "FK_dd8abd7d31569433ded80a1f395" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_leaders FK_e5b4f46c5ae1f08c0fcff3a463f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_leaders
    ADD CONSTRAINT "FK_e5b4f46c5ae1f08c0fcff3a463f" FOREIGN KEY ("allocateRevenueId") REFERENCES public.allocate_revenue(id) ON DELETE SET NULL;


--
-- Name: orders FK_e5de51ca888d8b1f5ac25799dd1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES public.customers(id);


--
-- Name: service_order_chat_participants FK_e6941f1f3c2977341ba45015abb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_participants
    ADD CONSTRAINT "FK_e6941f1f3c2977341ba45015abb" FOREIGN KEY ("addedByUserId") REFERENCES public.users(id);


--
-- Name: service_order_chat_participants FK_e701e3cc3438b46b8aae280e722; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_chat_participants
    ADD CONSTRAINT "FK_e701e3cc3438b46b8aae280e722" FOREIGN KEY ("serviceOrderId") REFERENCES public.service_orders(id) ON DELETE CASCADE;


--
-- Name: service_orders FK_ea0813fe0e0e491e45482a69547; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_orders
    ADD CONSTRAINT "FK_ea0813fe0e0e491e45482a69547" FOREIGN KEY ("vouchersId") REFERENCES public.vouchers(id);


--
-- Name: time_keepings FK_eb84524b31fd62e6180d5e31c0d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_eb84524b31fd62e6180d5e31c0d" FOREIGN KEY ("marginId") REFERENCES public.margins(id);


--
-- Name: finances FK_ef9e7898bc77af6ba71116ef61b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_ef9e7898bc77af6ba71116ef61b" FOREIGN KEY ("timeKeepingConfirmId") REFERENCES public.time_keeping_confirms(id);


--
-- Name: order_employees FK_f2b09f8d577bfb0c47d1c7b2407; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_employees
    ADD CONSTRAINT "FK_f2b09f8d577bfb0c47d1c7b2407" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: service_order_ratings FK_f6ecaeb2a49d13b3b9c8a358c20; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_order_ratings
    ADD CONSTRAINT "FK_f6ecaeb2a49d13b3b9c8a358c20" FOREIGN KEY ("employeeId") REFERENCES public.employees(id);


--
-- Name: file_uploads FK_f7e50c2129a315bd613162f8975; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT "FK_f7e50c2129a315bd613162f8975" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id);


--
-- Name: time_keepings FK_f8e662b1bb53f40441acb8865f8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_f8e662b1bb53f40441acb8865f8" FOREIGN KEY ("referralEmployeeId") REFERENCES public.employees(id);


--
-- Name: employee_tickets FK_fb0bb67ad0b5b1b5910e163a111; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_tickets
    ADD CONSTRAINT "FK_fb0bb67ad0b5b1b5910e163a111" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: finances FK_fb95586c8865a62ae54ab7dae58; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT "FK_fb95586c8865a62ae54ab7dae58" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: time_keepings FK_fd8000330a11fd01f530d930d07; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_keepings
    ADD CONSTRAINT "FK_fd8000330a11fd01f530d930d07" FOREIGN KEY ("referrerOrderId") REFERENCES public.orders(id);


--
-- Name: announcements FK_ff8f41b179316198f5b737fe957; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_ff8f41b179316198f5b737fe957" FOREIGN KEY ("sentBy") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: expense_approvals FK_ff9a946525ef1d021c8d274621b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_approvals
    ADD CONSTRAINT "FK_ff9a946525ef1d021c8d274621b" FOREIGN KEY ("approvedBy") REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict fs6Z1meuhCv8g68GdHUzny3fqEHNw8dpj1SIBhh1lkxSFY3B7idNLxLKIMRkg3u

