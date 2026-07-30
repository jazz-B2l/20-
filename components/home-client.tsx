'use client'

import { Header } from '@/components/header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HomeClient() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Bienvenue sur le Portail 20%
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Découvrez les programmes de master disponibles dans les universités algériennes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto">
                Parcourir
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg text-foreground mb-2">Découvrez</h3>
            <p className="text-muted-foreground">Explorez les programmes de master offerts par les universités algériennes</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg text-foreground mb-2">Filtrez</h3>
            <p className="text-muted-foreground">Recherchez par wilaya, domaine, et niveau d&apos;études</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg text-foreground mb-2">Signalez</h3>
            <p className="text-muted-foreground">Aidez-nous en signalant les corrections nécessaires</p>
          </div>
        </div>
      </main>
    </div>
  )
}
