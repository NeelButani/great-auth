import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../app.js'

describe('Health Check API', () => {
  let server

  beforeAll(() => {
    // Start the server before tests run
    server = app.listen(3001)
  })

  afterAll(() => {
    // Close the server after tests finish
    server.close()
  })

  it('should return 200 with health status', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
  })

  it('should have database service status', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    expect(data.services).toBeDefined()
    expect(data.services.database).toBeDefined()
    expect(data.services.database.status).toBe('ok')
  })

  it('should have redis service status', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    expect(data.services).toBeDefined()
    expect(data.services.redis).toBeDefined()
    expect(data.services.redis.status).toBe('ok')
  })

  it('should have timestamp in response', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    expect(data.timestamp).toBeDefined()
    expect(typeof data.timestamp).toBe('string')
  })

  it('should have response times for services', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    expect(data.services.database.responseTime).toBeDefined()
    expect(data.services.redis.responseTime).toBeDefined()
  })

  it('should return 404 for non-existent routes', async () => {
    const response = await fetch('http://localhost:3001/api/nonexistent')
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toContain('not found')
  })
})