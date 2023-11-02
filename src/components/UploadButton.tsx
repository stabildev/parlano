'use client'

import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { useState } from 'react'

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        onClick={() => setIsOpen(true)}
        className={buttonVariants()}
      >
        Upload PDF
      </DialogTrigger>

      <DialogContent>yulpf</DialogContent>
    </Dialog>
  )
}

export default UploadButton
