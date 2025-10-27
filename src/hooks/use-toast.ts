// Toast hook - placeholder
export function useToast() {
  return {
    toast: function(msg: any) {
      console.log('Toast:', msg)
    }
  }
}

