<script setup lang="ts">
import AccessTokenDto from '#dtos/access_token'
import TokenActions from '#enums/token_actions'
import axios from 'axios'
import { Loader } from 'lucide-vue-next'
import { DateTime } from 'luxon'
import { ref } from 'vue'

defineProps<{ tokens: AccessTokenDto[] }>()

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
