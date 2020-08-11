// test('test 1', ()=> {
//     throw new Error('Failed')
// })

test('test 2', ()=> {
    expect(12).toBeTruthy();
})

// test('Async test 1', (done)=> {
//     setTimeout(() => {
//         expect(false).toBeTruthy();
//         done();
//     }, 2000);
// })

// test('Async test 2', async ()=> {
//     const sum = await someasuncfunction(2, 2);
//     expect(sum).toBe(4)
// })
