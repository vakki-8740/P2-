import ComplainForm from '../../components/ComplainForm'

/** Bank Statement Complain — form ka saara logic ComplainForm me hai. */
export default function BankStatementComplain() {
  return (
    <ComplainForm
      type="Bank Statement"
      title="Bank Statement Complain"
  files={[{ key: 'bankStatement', label: 'Upload Bank Statement', accept: 'image/*,.pdf' }]}
      requiredFilesMessage="Please upload Bank Statement"
    />
  )
}
