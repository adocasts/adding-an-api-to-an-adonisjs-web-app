<script setup lang="ts">
import TokenActions from '#enums/token_actions'
import axios from 'axios'
import { Loader } from 'lucide-vue-next'
import { ref } from 'vue'

const isDialogShown = ref(false)
const processing = ref(false)
const permissionOptions = Object.values(TokenActions)
const form = ref({
  name: '',
  permissions: new Set(['read']),
})

async function onSubmit() {
  processing.value = true

  const { data } = await axios.post('/settings/organization/access-tokens', {
    name: form.value.name,
    permissions: [...form.value.permissions],
  })

  processing.value = false
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Organization Access Tokens</CardTitle>
      <CardDescription>Manage tokens your organization can use to access our API.</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex justify-end mt-4">
        <Button type="button" @click="isDialogShown = true"> Add Access Token </Button>
      </div>
    </CardContent>
  </Card>

  <Dialog v-model:open="isDialogShown">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Access Token</DialogTitle>
      </DialogHeader>

      <form id="accessTokenDialog" @submit.prevent="onSubmit">
        <FormInput
          label="Name"
          type="text"
          class="flex-1"
          v-model="form.name"
          :disabled="processing"
        />

        <div class="flex flex-col gap-3 my-3">
          <Label>Permissions</Label>

          <FormInput type="group">
            <div v-for="option in permissionOptions" :key="option" class="flex items-center gap-2">
              <Checkbox
                :checked="form.permissions.has(option)"
                :disable="processing"
                @update:checked="
                  $event ? form.permissions.add(option) : form.permissions.delete(option)
                "
              />
              <span class="capitalize">{{ option }}</span>
            </div>
          </FormInput>
        </div>
      </form>

      <DialogFooter>
        <Button type="submit" :disabled="processing" form="accessTokenDialog">
          <Loader v-if="processing" class="mr-2 h-4 w-4 animate-spin" />
          Create Access Token
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
