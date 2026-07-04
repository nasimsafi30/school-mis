import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'

const f = createUploadthing()

const handleAuth = async () => {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  return { userId: session.user?.id }
}

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
      return { url: file.url }
    }),

  documentUploader: f({
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    text: { maxFileSize: '8MB', maxFileCount: 10 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, name: file.name }
    }),

  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
