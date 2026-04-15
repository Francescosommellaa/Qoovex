import { ClerkProvider, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <ClerkProvider>
          <SignInButton />
          <SignUpButton>
            <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>

          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
