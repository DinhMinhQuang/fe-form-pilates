interface EmptyRowProps {
  colSpan: number;
  message?: string;
}

export default function EmptyRow({ colSpan, message = "Chưa có dữ liệu" }: EmptyRowProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-sm text-center"
        style={{ color: "var(--warm-gray-light)" }}
      >
        {message}
      </td>
    </tr>
  );
}
