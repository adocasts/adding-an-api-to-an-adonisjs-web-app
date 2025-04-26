<script setup lang="ts">
import AccessTokenDto from '#dtos/access_token'
import TokenActions from '#enums/token_actions'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import { Clipboard, ClipboardCheck, Loader } from 'lucide-vue-next'
import { DateTime } from 'luxon'
import { ref } from 'vue'

defineProps<{ tokens: AccessTokenDto[] }>()

let copyTimeout: NodeJS.Timeout | null = null
const isDialogShown = ref(false)
const processing = ref(false)
const isCopied = ref(false)
const token = ref<string | null>(null)
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

  token.value = data.accessToken.token

  processing.value = false

  router.reload({ only: ['accessTokens'] })
}

function onCopy() {
  if (!token.value) return
  if (copyTimeout) clearTimeout(copyTimeout)

  navigator.clipboard.writeText(token.value)
  isCopied.value = true

  copyTimeout = setTimeout(() => (isCopied.value = false), 1_000)
}

function onClose() {
  isDialogShown.value = false
  token.value = null
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Organization Access Tokens</CardTitle>
      <CardDescription>Manage tokens your organization can use to access our API.</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in tokens" :key="item.id">
            <TableCell>
              {{ item.name }}
            </TableCell>
            <TableCell class="capitalize">
              {{ item.abilities.join(', ') }}
            </TableCell>
            <TableCell>
              {{ DateTime.fromISO(item.createdAt).toLocaleString() }}
            </TableCell>
            <TableCell>
              <span v-if="item.lastUsedAt">
                {{ DateTime.fromISO(item.lastUsedAt).toLocaleString() }}
              </span>
            </TableCell>
            <TableCell>
              <!-- delete button -->
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="flex justify-end mt-4">
        <Button type="button" @click="isDialogShown = true"> Add Access Token </Button>
      </div>
    </CardContent>
  </Card>

  <Dialog v-model:open="isDialogShown">
    <DialogContent v-if="token">
      <DialogHeader>
        <DialogTitle>Access Token Created</DialogTitle>
      </DialogHeader>

      <p>
        Please copy your access token below and store it somewhere safe. Once this dialog is closed,
        you will not be able to access your token again.
      </p>

      <div class="relative">
        <Input type="text" :model-value="token" />
        <Button
          variant="outline"
          size="icon"
          class="absolute right-1 top-1 !w-8 !h-8 z-20 shadow-md"
          @click="onCopy"
        >
          <ClipboardCheck v-if="isCopied" class="w-4 h-4 text-green-500" />
          <Clipboard v-else class="w-4 h-4" />
        </Button>
        <div
          class="absolute right-1 top-px w-32 h-[calc(100%-2px)] z-10 bg-gradient-to-r from-transparent to-white"
        ></div>
      </div>

      <DialogFooter>
        <Button type="button" @click="onClose"> Got my token! Close Dialog </Button>
      </DialogFooter>
    </DialogContent>
    <DialogContent v-else>
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
