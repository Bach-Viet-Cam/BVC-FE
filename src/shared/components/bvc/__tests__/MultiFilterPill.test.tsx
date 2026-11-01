import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiFilterPill } from "@/shared/components/bvc/MultiFilterPill";

const options = [
  { value: "tranh", label: "Đàn tranh" },
  { value: "bau", label: "Đàn bầu" },
  { value: "sao", label: "Sáo trúc" },
];

interface HarnessProps {
  onChange: (values: string[]) => void;
}

function Harness({ onChange }: HarnessProps) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <MultiFilterPill
      label="Nhạc cụ"
      values={values}
      options={options}
      onChange={(next) => {
        setValues(next);
        onChange(next);
      }}
    />
  );
}

describe("MultiFilterPill", () => {
  it("ticks several options and summarises the selection on the pill", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Lọc theo Nhạc cụ" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Đàn tranh" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Sáo trúc" }));

    expect(onChange).toHaveBeenLastCalledWith(["tranh", "sao"]);
    expect(screen.getByRole("checkbox", { name: "Đàn tranh" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Lọc theo Nhạc cụ" })).toHaveTextContent("Nhạc cụ: 2 đã chọn");

    await userEvent.click(screen.getByRole("checkbox", { name: "Đàn tranh" }));
    expect(onChange).toHaveBeenLastCalledWith(["sao"]);
    expect(screen.getByRole("button", { name: "Lọc theo Nhạc cụ" })).toHaveTextContent("Nhạc cụ: Sáo trúc");
  });

  it("clears every selected value with the pill's remove button", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lọc theo Nhạc cụ" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Đàn bầu" }));

    await userEvent.click(screen.getByRole("button", { name: "Bỏ lọc Nhạc cụ" }));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
