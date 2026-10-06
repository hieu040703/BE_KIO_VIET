import "reflect-metadata";

jest.mock("../stringee.service", () => ({
  StringeeService: class {},
}));

import { StringeeController } from "../stringee.controller";

describe("StringeeController.getRecording", () => {
  it("passes range and download options to the service and pipes the response stream", async () => {
    const stream = {
      on: jest.fn(),
      pipe: jest.fn(),
    };
    const service = {
      getRecordingStream: jest.fn().mockResolvedValue({
        stream,
        statusCode: 206,
        headers: {
          "content-type": "audio/mpeg",
          "content-range": "bytes 0-9/100",
          "content-disposition": 'attachment; filename="call-recording-history-1.mp3"',
        },
      }),
    };
    const controller = new StringeeController(service as any);
    const req = {
      params: { id: "history-1" },
      headers: { range: "bytes=0-9" },
      query: { download: "1" },
    } as any;
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      destroy: jest.fn(),
    } as any;
    const next = jest.fn();

    await controller.getRecording(req, res, next);

    expect(service.getRecordingStream).toHaveBeenCalledWith("history-1", "bytes=0-9", true);
    expect(res.status).toHaveBeenCalledWith(206);
    expect(res.setHeader).toHaveBeenCalledWith("content-type", "audio/mpeg");
    expect(res.setHeader).toHaveBeenCalledWith("content-range", "bytes 0-9/100");
    expect(res.setHeader).toHaveBeenCalledWith(
      "content-disposition",
      'attachment; filename="call-recording-history-1.mp3"',
    );
    expect(stream.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(stream.pipe).toHaveBeenCalledWith(res);
    expect(next).not.toHaveBeenCalled();
  });
});
