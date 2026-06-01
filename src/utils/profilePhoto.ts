import * as FileSystem from 'expo-file-system/legacy';

const PHOTO_FILENAME = 'profile-photo.jpg';

export async function saveProfilePhotoLocally(uri: string): Promise<string> {
  const dest = `${FileSystem.documentDirectory}${PHOTO_FILENAME}`;
  const existing = await FileSystem.getInfoAsync(dest);
  if (existing.exists) await FileSystem.deleteAsync(dest);
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
