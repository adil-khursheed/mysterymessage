"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useCompletion } from "ai/react";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { messageSchema } from "@/schemas/messageSchema";

import axios, { AxiosError } from "axios";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

import { ApiResponse } from "@/types/ApiResponse";

import { Loader2 } from "lucide-react";

const initialMessages =
  "What is your favorite past time?||What are your hobbies?||How often do you party?";

const SendUserMessagePage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { username } = useParams<{ username: string }>();

  const {
    complete,
    completion,
    isLoading: suggestMessagesLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessages,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleSuggestedMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
      });

      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete("");
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading || !messageContent}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait
              </>
            ) : (
              <>Send it</>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            disabled={suggestMessagesLoading}
            className="my-4">
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>

        <Card>
          <CardHeader>
            <h4 className="text-xl font-semibold">Messages</h4>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">Something went wrong!</p>
            ) : suggestMessagesLoading ? (
              <>
                <Button variant={"outline"}>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading Messages...
                </Button>
              </>
            ) : (
              completion.split("||").map((message, index) => (
                <Button
                  key={index}
                  variant={"outline"}
                  onClick={() => handleSuggestedMessageClick(message)}>
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default SendUserMessagePage;
