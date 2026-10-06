export const RETAIL_ATTENDANCE_DEVICES_TYPES = {
  Repository: Symbol.for("RetailAttendanceDevicesRepository"),
  Service: Symbol.for("RetailAttendanceDevicesService"),
  Controller: Symbol.for("RetailAttendanceDevicesController"),
  Router: Symbol.for("RetailAttendanceDevicesRouter"),
} as const;

export const ATTENDANCEDEVICES_RESOURCE = "attendance-devices" as const;
