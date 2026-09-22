import type { Transaction } from "@/types/transaction"

interface Props {
    transaction?: Transaction,
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TransactionForm({}: Props) {
  return (
    <div>TransactionForm</div>
  )
}