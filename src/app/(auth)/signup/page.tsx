import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function SignupPage(){
    return(
        <Card>
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>We&apos;ll email you a 6-digit code to verify it</CardDescription>
            </CardHeader>
            <CardContent>
                <SignupForm/>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
                Already have an account?&nbsp;
                <Link href="login" className="text-foreground underline-offset-4 hover:underline">Log in</Link>
            </CardFooter>
        </Card>
    )
}