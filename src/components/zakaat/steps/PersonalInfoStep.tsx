import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { alert } from '../../../store/alertStore';
import type { PersonalInfo, OrganizationInfo, ApplicationType } from '../../../types/zakaat.types';
import DatePicker from '../../ui/DatePicker';
import Select from '../../ui/Select';

interface PersonalInfoStepProps {
	applicationType: ApplicationType;
	initialValue?: PersonalInfo | OrganizationInfo | null;
	onComplete: (data: { personalInfo: PersonalInfo | OrganizationInfo }) => void;
	onBack: () => void;
}

export default function PersonalInfoStep({
	applicationType,
	initialValue,
	onComplete,
	onBack,
}: PersonalInfoStepProps) {
	const isIndividual = applicationType === 'individual';

	// Individual form state
	const [firstName, setFirstName] = useState((initialValue as PersonalInfo)?.firstName || '');
	const [lastName, setLastName] = useState((initialValue as PersonalInfo)?.lastName || '');
	const [email, setEmail] = useState((initialValue as PersonalInfo)?.email || '');
	const [phoneNumber, setPhoneNumber] = useState(
		(initialValue as PersonalInfo)?.phoneNumber || ''
	);
	const [dateOfBirth, setDateOfBirth] = useState(
		(initialValue as PersonalInfo)?.dateOfBirth || ''
	);
	const [gender, setGender] = useState((initialValue as PersonalInfo)?.gender || '');
	const [address, setAddress] = useState((initialValue as PersonalInfo)?.address || '');

	// Organization form state
	const [organizationName, setOrganizationName] = useState(
		(initialValue as OrganizationInfo)?.organizationName || ''
	);
	const [registrationNumber, setRegistrationNumber] = useState(
		(initialValue as OrganizationInfo)?.registrationNumber || ''
	);
	const [organizationType, setOrganizationType] = useState(
		(initialValue as OrganizationInfo)?.organizationType || ''
	);
	const [orgAddress, setOrgAddress] = useState((initialValue as OrganizationInfo)?.address || '');
	const [orgEmail, setOrgEmail] = useState((initialValue as OrganizationInfo)?.email || '');
	const [orgPhoneNumber, setOrgPhoneNumber] = useState(
		(initialValue as OrganizationInfo)?.phoneNumber || ''
	);

	const handleSubmit = () => {
		if (isIndividual) {
			if (!firstName || !lastName || !email || !phoneNumber) {
				alert.error('Please fill in all required fields');
				return;
			}
			onComplete({
				personalInfo: {
					firstName,
					lastName,
					email,
					phoneNumber,
					dateOfBirth: dateOfBirth || undefined,
					gender: gender || undefined,
					address: address || undefined,
				},
			});
		} else {
			if (
				!organizationName ||
				!registrationNumber ||
				!organizationType ||
				!orgAddress ||
				!orgEmail ||
				!orgPhoneNumber
			) {
				alert.error('Please fill in all required fields');
				return;
			}
			onComplete({
				personalInfo: {
					organizationName,
					registrationNumber,
					organizationType,
					address: orgAddress,
					email: orgEmail,
					phoneNumber: orgPhoneNumber,
				},
			});
		}
	};

	return (
		<div className="space-y-6">
			{isIndividual ? (
				<>
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							First Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="Enter your first name"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Last Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							placeholder="Enter your last name"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your.email@example.com"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Phone Number <span className="text-red-500">*</span>
						</label>
						<input
							type="tel"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder="+1234567890"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<DatePicker
						value={dateOfBirth}
						onChange={setDateOfBirth}
						placeholder="Select date of birth"
						maxDate={new Date().toISOString().split('T')[0]}
						label="Date of Birth"
					/>

					<Select
						value={gender}
						onChange={setGender}
						options={[
							{ value: 'male', label: 'Male' },
							{ value: 'female', label: 'Female' },
							{ value: 'other', label: 'Other' },
							{ value: 'prefer-not-to-say', label: 'Prefer not to say' },
						]}
						placeholder="Select gender"
						label="Gender"
					/>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Address
						</label>
						<textarea
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="Enter your address"
							rows={3}
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 resize-none"
						/>
					</div>
				</>
			) : (
				<>
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Organization Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
							placeholder="Enter organization name"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Registration Number <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={registrationNumber}
							onChange={(e) => setRegistrationNumber(e.target.value)}
							placeholder="Enter registration number"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<Select
						value={organizationType}
						onChange={setOrganizationType}
						options={[
							{ value: 'NGO', label: 'NGO' },
							{ value: 'Charity', label: 'Charity' },
							{ value: 'Religious Organization', label: 'Religious Organization' },
							{ value: 'Other', label: 'Other' },
						]}
						placeholder="Select organization type"
						label={
							<>
								Organization Type <span className="text-red-500">*</span>
							</>
						}
					/>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Address <span className="text-red-500">*</span>
						</label>
						<textarea
							value={orgAddress}
							onChange={(e) => setOrgAddress(e.target.value)}
							placeholder="Enter organization address"
							rows={3}
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 resize-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							value={orgEmail}
							onChange={(e) => setOrgEmail(e.target.value)}
							placeholder="organization@example.com"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Phone Number <span className="text-red-500">*</span>
						</label>
						<input
							type="tel"
							value={orgPhoneNumber}
							onChange={(e) => setOrgPhoneNumber(e.target.value)}
							placeholder="+1234567890"
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
						/>
					</div>
				</>
			)}

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onBack}
					className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Back
				</button>
				<button
					onClick={handleSubmit}
					className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
				>
					Continue
				</button>
			</div>
		</div>
	);
}
