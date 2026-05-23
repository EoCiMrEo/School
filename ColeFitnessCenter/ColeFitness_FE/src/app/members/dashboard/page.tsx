"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  Dumbbell,
  User,
  Activity,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("equipment");
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    address: "123 Fitness St, Gym City, SP 12345",
    profilePicture: "/placeholder.svg",
  });

  const equipmentData = [
    {
      name: "Treadmill",
      description: "High-end running machine",
      availability: "Available",
      image:
        "https://images.unsplash.com/photo-1591940765155-0604537032a5?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Rowing Machine",
      description: "Full-body workout equipment",
      availability: "In Use",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Weight Bench",
      description: "Adjustable weight bench",
      availability: "Available",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Elliptical",
      description: "Low-impact cardio machine",
      availability: "Available",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Squat Rack",
      description: "For heavy lifting and squats",
      availability: "In Use",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Leg Press",
      description: "Lower body strength machine",
      availability: "Available",
      image: "/placeholder.svg?height=100&width=100",
    },
  ];

  const classData = [
    {
      name: "Yoga Flow",
      description: "Beginner friendly yoga class",
      schedule: "Mon, Wed, Fri 8:00 AM",
      slots: 5,
    },
    {
      name: "HIIT Blast",
      description: "High-intensity interval training",
      schedule: "Tue, Thu 6:00 PM",
      slots: 3,
    },
    {
      name: "Spin Class",
      description: "Indoor cycling workout",
      schedule: "Sat 10:00 AM",
      slots: 8,
    },
  ];

  const scheduledClasses = [
    { name: "Yoga Flow", date: "2023-05-15", time: "8:00 AM" },
    { name: "HIIT Blast", date: "2023-05-16", time: "6:00 PM" },
  ];

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      profilePicture: profileData.profilePicture,
    };
    setProfileData(updatedProfile);
    // Here you would typically send this data to your backend
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Navbar></Navbar>
      <div className="h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profileData.name.split(" ")[0]}!
            </h1>
            <div className="flex justify-center items-center">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="destructive" className="ml-2">
                Log Out
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Membership Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Status:</strong> Active
                  </p>
                  <p>
                    <strong>Plan:</strong> Premium
                  </p>
                  <p>
                    <strong>Renewal Date:</strong> 2023-12-31
                  </p>
                  <Progress value={75} className="mt-2" />
                  <p className="text-sm text-gray-500">
                    75 days left in current plan
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={profileData.profilePicture}
                      alt="Profile picture"
                    />
                    <AvatarFallback>
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profileData.name}
                    </h3>
                    <p className="text-gray-500">{profileData.email}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when
                            you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleProfileUpdate}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="profilePicture"
                                className="text-right"
                              >
                                Picture
                              </Label>
                              <div className="col-span-3">
                                <Input
                                  id="profilePicture"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfilePictureChange}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                defaultValue={profileData.name}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="email" className="text-right">
                                Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                defaultValue={profileData.email}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="phone" className="text-right">
                                Phone
                              </Label>
                              <Input
                                id="phone"
                                name="phone"
                                defaultValue={profileData.phone}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="address" className="text-right">
                                Address
                              </Label>
                              <Input
                                id="address"
                                name="address"
                                defaultValue={profileData.address}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workouts
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +10% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fitness Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78/100</div>
                <p className="text-xs text-muted-foreground">
                  +5 points from last assessment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Group Classes Attended
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equipment">
                <Dumbbell className="h-4 w-4 mr-2" />
                Equipment
              </TabsTrigger>
              <TabsTrigger value="classes">
                <Calendar className="h-4 w-4 mr-2" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <User className="h-4 w-4 mr-2" />
                My Schedule
              </TabsTrigger>
            </TabsList>
            <TabsContent value="equipment">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Access</CardTitle>
                  <CardDescription>
                    Browse available gym equipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full max-w-5xl mx-auto">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {equipmentData.map((item, index) => (
                        <CarouselItem
                          key={index}
                          className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4"
                        >
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex flex-col items-center p-6">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-32 object-cover mb-4 rounded"
                                />
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500 text-center">
                                  {item.description}
                                </p>
                                <Badge
                                  variant={
                                    item.availability === "Available"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="mt-2"
                                >
                                  {item.availability}
                                </Badge>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="classes">
              <Card>
                <CardHeader>
                  <CardTitle>Class Registration</CardTitle>
                  <CardDescription>Sign up for fitness classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classData.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                            <p className="text-sm">{item.schedule}</p>
                          </div>
                          <div className="text-right">
                            <Badge>{item.slots} slots left</Badge>
                            <Button size="sm" className="mt-2">
                              Register
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Schedule</CardTitle>
                  <CardDescription>
                    Your upcoming classes and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledClasses.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm">
                              {item.date} at {item.time}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
