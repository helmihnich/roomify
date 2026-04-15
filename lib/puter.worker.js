const PROJECT_PREFIX = 'roomify_project_'

const jsonError = (status, message, extra= {}) =>{
    return new Response(JSON.stringify( {error: message, ...extra} ), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const getUserId = async (userPuter)=>{
    try {
        const user = await userPuter.auth.getUser()
        return user?.uuid || null  
    } catch  {
        return null
    }
}

router.post('/api/projects/save', async ({ request, user })=>{
    try {
        const userPuter = user.puter
        if (!userPuter) {
            return jsonError(401, 'Authentification failed')
        }

        const body = await request.json()

        const project = body?.project

        if (!project?.id) {
            return jsonError(400, 'Project not found')
        }

        const payload = {
            ...project,
            visibility: body?.visibility || project?.visibility,
            updatedAt: new Date().toISOString()
        }

        const userId = await getUserId(userPuter)

        if (!userId) {
            return jsonError(401, 'Authentification failed')
        }

        const key = `${PROJECT_PREFIX}${project.id}`
        await userPuter.kv.set(key, payload)

        return {saved: true, id: project.id, project: payload}
    } catch (e) {
        return jsonError(500, 'Failed to save project', {message: e.message || 'Unknown error'})
    }
})

router.get('/api/projects/list', async ({ request, user }) => {
    try {
        const userPuter = user.puter
        if (!userPuter) {
            return jsonError(401, 'Authentification failed')
        }

        const userId = await getUserId(userPuter)
        if (!userId) {
            return jsonError(401, 'Authentification failed')
        }

        const projects = (await userPuter.kv.list(`${PROJECT_PREFIX}`, true)).map(({value}) => ({...value, isPublic: value.visibility === 'public'}))

        return { projects }
    } catch (e) {
        return jsonError(500, 'Failed to list projects', {message: e.message || 'Unknown error'})
    }
})

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter
        if (!userPuter) {
            return jsonError(401, 'Authentification failed')
        }

        const userId = await getUserId(userPuter)
        if (!userId) {
            return jsonError(401, 'Authentification failed')
        }

        const url = new URL(request.url)
        const id = url.searchParams.get('id')

        if (!id) {
            return jsonError(400, 'Project ID is required')
        }

        const key = `${PROJECT_PREFIX}${id}`
        const project = await userPuter.kv.get(key)

        if (!project) {
            return jsonError(400, 'Project not found')
        }

        return { project }
    } catch (e) {
        return jsonError(500, 'Failed to fetch project', {message: e.message || 'Unknown error'})
    }
})