"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Users, Dumbbell, Clock, CheckCircleIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen bg-black bg-opacity-70">
          <Image
            src="/hero-2.jpg?height=1080&width=1920"
            alt="Fitness enthusiasts working out in a modern gym"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
          <div className="relative z-20 text-white text-center px-4 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto flex flex-col items-center justify-center pt-20 space-y-6">
            <motion.h1
              className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Elevate Your Fitness Journey
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join our club and transform your body, mind, and lifestyle with
              state-of-the-art facilities and expert trainers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-6 py-3 bg-transparent text-white border-white hover:bg-white hover:text-black"
              >
                View Membership Plans
              </Button>
            </motion.div>
          </div>

          {/* Feature Cards Section */}
          <div className="relative z-20 mt-16 px-4 sm:px-6 lg:px-8 pb-5 max-w-5xl mx-auto w-full">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white bg-opacity-10 backdrop-blur-md text-white shadow-lg rounded-lg">
                  <CardHeader className="flex flex-col items-center">
                    <Users className="w-8 h-8 mb-2 text-teal-400" />
                    <CardTitle className="text-lg font-medium">
                      Expert Trainers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Certified trainers guide you every step of your fitness
                    journey.
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white bg-opacity-10 backdrop-blur-md text-white shadow-lg rounded-lg">
                  <CardHeader className="flex flex-col items-center">
                    <Dumbbell className="w-8 h-8 mb-2 text-teal-400" />
                    <CardTitle className="text-lg font-medium">
                      State-of-the-Art Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Modern equipment for efficient and effective workouts.
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white bg-opacity-10 backdrop-blur-md text-white shadow-lg rounded-lg">
                  <CardHeader className="flex flex-col items-center">
                    <Clock className="w-8 h-8 mb-2 text-teal-400" />
                    <CardTitle className="text-lg font-medium">
                      24/7 Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Our clubs are open 24/7, so you can work out on your
                    schedule.
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Membership Tiers Section */}
        <section id="memberships" className="py-20 bg-gray-100 text-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-light mb-12 text-center">
              Membership Tiers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <Card className="shadow-md rounded-md border border-gray-200 bg-white">
                <CardHeader className="text-center border-b border-gray-200">
                  <CardTitle className="text-2xl font-medium text-gray-900">
                    Basic
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-500">
                    Perfect for beginners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 my-6 text-sm text-gray-700">
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Access to gym equipment
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Locker room access
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      1 fitness class per week
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      1-week trial session
                    </li>
                  </ul>
                  <p className="text-3xl font-semibold text-gray-900 mt-4">
                    $29.99/month
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                    Choose Basic
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan - Highlighted */}
              <Card className="shadow-md rounded-md border-2 border-teal-500 bg-white">
                <CardHeader className="text-center border-b border-gray-200">
                  <div className="bg-teal-500 text-white font-bold py-1 px-3 rounded-full inline-block">
                    Most Popular
                  </div>
                  <CardTitle className="text-2xl font-medium text-gray-900 mt-4">
                    Premium
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-500">
                    Our most popular plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 my-6 text-sm text-gray-700">
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      All Basic features
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Unlimited fitness classes
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Personal trainer session (1/month)
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Nutrition consultation
                    </li>
                  </ul>
                  <p className="text-3xl font-semibold text-gray-900 mt-4">
                    $59.99/month
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                    Choose Premium
                  </Button>
                </CardFooter>
              </Card>

              {/* Elite Plan */}
              <Card className="shadow-md rounded-md border border-gray-200 bg-white">
                <CardHeader className="text-center border-b border-gray-200">
                  <CardTitle className="text-2xl font-medium text-gray-900">
                    Elite
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-500">
                    For the dedicated athlete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 my-6 text-sm text-gray-700">
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      All Premium features
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Personal trainer sessions (2/week)
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Exclusive classes
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 mr-2" />
                      Recovery spa access
                    </li>
                  </ul>
                  <p className="text-3xl font-semibold text-gray-900 mt-4">
                    $99.99/month
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                    Choose Elite
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Locations Section */}

        {/* Locations Section with Pictures */}
        <section
          id="locations"
          className="py-20 bg-gradient-to-b from-secondary to-background"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-light mb-12 text-center">
              Our Locations
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white overflow-hidden">
                <Image
                  src="/location-1.jpg?height=300&width=400"
                  alt="Downtown FitLife Club"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-6 h-6 mr-2" /> Downtown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>123 Main St, City Center</p>
                  <p>Open 24/7</p>
                  <p>Phone: (123) 456-7890</p>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full">
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-white overflow-hidden">
                <Image
                  src="/location-2.jpg?height=300&width=400"
                  alt="Westside FitLife Club"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-6 h-6 mr-2" /> Westside
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>456 West Blvd, Westside</p>
                  <p>Open 24/7</p>
                  <p>Phone: (123) 456-7891</p>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full">
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-white overflow-hidden">
                <Image
                  src="/location-3.jpg?height=300&width=400"
                  alt="Eastside FitLife Club"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-6 h-6 mr-2" /> Eastside
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>789 East Ave, Eastside</p>
                  <p>Open 24/7</p>
                  <p>Phone: (123) 456-7892</p>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full">
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Cole's Fitness Club</h3>
              <p>Transform Your Body, Transform Your Life</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#memberships" className="hover:underline">
                    Memberships
                  </Link>
                </li>
                <li>
                  <Link href="#locations" className="hover:underline">
                    Locations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p>Email: info@Cole's Fitnessclub.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 Cole's Fitness Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
