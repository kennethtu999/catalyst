import {bind} from '../lib/bind.js'

describe('bind', () => {
  window.customElements.define('bind-test-element', class extends HTMLElement {})

  it('queries for Elements matching data-action*="tagname"', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'querySelectorAll', () => [])
    bind(instance)
    expect(instance.querySelectorAll).to.have.been.called.once.with.exactly('[data-action*=":bind-test-element#"]')
  })

  it('binds events on elements based on their data-action attribute', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => instance
    el.getAttribute = () => 'click:bind-test-element#foo'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.been.called.once.with('click')
    const {calls} = el.addEventListener.__spy
    const fn = calls[0][1]
    expect(instance.foo).to.have.not.been.called()
    fn()
    expect(instance.foo).to.have.been.called(1)
  })

  it('allows for the presence of `:` in an event name', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => instance
    el.getAttribute = () => 'custom:event:bind-test-element#foo'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.been.called.once.with('custom:event')
    const {calls} = el.addEventListener.__spy
    const fn = calls[0][1]
    expect(instance.foo).to.have.not.been.called()
    fn()
    expect(instance.foo).to.have.been.called(1)
  })

  it('binds events on the controller to itself', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    instance.matches = () => true
    instance.getAttribute = () => 'click:bind-test-element#foo'
    instance.addEventListener = () => true
    instance.querySelectorAll = () => []
    chai.spy.on(instance, 'addEventListener')
    bind(instance)
    expect(instance.addEventListener).to.have.been.called.once.with('click')
    const {calls} = instance.addEventListener.__spy
    const fn = calls[0][1]
    expect(instance.foo).to.have.not.been.called()
    fn()
    expect(instance.foo).to.have.been.called(1)
  })

  it('does not bind elements whose closest selector is not this controller', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => null
    el.getAttribute = () => 'click:bind-test-element#foo'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.not.been.called()
  })

  it('does not bind elements whose data-action does not match controller tagname', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => null
    el.getAttribute = () => 'click:other-controller#foo'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.not.been.called()
  })

  it('does not bind methods that dont exist', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => instance
    el.getAttribute = () => 'click:bind-test-element#frob'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.not.been.called()
  })

  it('can bind multiple event types', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el = document.createElement('div')
    instance.querySelectorAll = () => [el]
    el.closest = () => instance
    el.getAttribute = () => 'click:bind-test-element#foo submit:bind-test-element#foo'
    chai.spy.on(el, 'addEventListener')
    bind(instance)
    expect(el.addEventListener).to.have.been.called(2)
    expect(el.addEventListener).to.be.first.called.with('click')
    expect(el.addEventListener).to.be.second.called.with('submit')
    const {calls} = el.addEventListener.__spy
    expect(instance.foo).to.have.not.been.called()
    calls[0][1]('a')
    expect(instance.foo).to.have.been.called.once.with('a')
    calls[1][1]('b')
    expect(instance.foo).to.have.been.called.twice.second.with('b')
  })

  it('can bind multiple elements to the same event', () => {
    const instance = document.createElement('bind-test-element')
    chai.spy.on(instance, 'foo')
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    instance.querySelectorAll = () => [el1, el2]
    el1.closest = () => instance
    el2.closest = () => instance
    el1.getAttribute = () => 'click:bind-test-element#foo'
    el2.getAttribute = () => 'submit:bind-test-element#foo'
    chai.spy.on(el1, 'addEventListener')
    chai.spy.on(el2, 'addEventListener')
    bind(instance)
    expect(el1.addEventListener).to.be.called.once.with('click')
    expect(el2.addEventListener).to.be.called.once.with('submit')
    expect(instance.foo).to.have.not.been.called()
    el1.addEventListener.__spy.calls[0][1]('a')
    expect(instance.foo).to.have.been.called.once.with('a')
    el2.addEventListener.__spy.calls[0][1]('b')
    expect(instance.foo).to.have.been.called.twice.second.with('b')
  })
})