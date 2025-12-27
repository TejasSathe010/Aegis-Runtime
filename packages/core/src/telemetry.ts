export interface Telemetry {
  span<T>(name: string, attrs: Record<string, string | number | boolean>, fn: () => Promise<T>): Promise<T>;
  metric(name: string, value: number, attrs?: Record<string, string>): void;
}

export const NoopTelemetry: Telemetry = {
  async span(_name, _attrs, fn) {
    return await fn();
  },
  metric(_name, _value, _attrs) {}
};
