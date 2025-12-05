import Alert from '../ui/Alert';
import { useAlertStore } from '../../store/alertStore';

export default function AlertProvider() {
	const {
		isOpen,
		title,
		message,
		variant,
		showIcon,
		autoClose,
		autoCloseDelay,
		closeAlert,
	} = useAlertStore();

	return (
		<Alert
			isOpen={isOpen}
			onClose={closeAlert}
			title={title}
			message={message}
			variant={variant}
			showIcon={showIcon}
			autoClose={autoClose}
			autoCloseDelay={autoCloseDelay}
		/>
	);
}

