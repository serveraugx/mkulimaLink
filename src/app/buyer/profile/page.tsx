import ProfileForm from '@/components/profile/ProfileForm';

export default function BuyerProfilePage() {
  return (
    <ProfileForm
      showLocation
      locationHint="Your location — used to show distance to each market in Market Explorer"
    />
  );
}
